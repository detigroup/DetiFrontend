# Copilot Instructions for DetiFrontend

A React 19 + TypeScript + Vite crypto trading CEX platform with AI-powered market insights.

## Architecture Overview

### Core Structure
- **App.tsx**: Root component managing state (portfolio, orders, auth, UI view navigation)
- **types.ts**: Central type definitions (AppView, MarketPair, Order, PortfolioAsset, ChartDataPoint)
- **constants.ts**: Mock market data (MOCK_PAIRS, INITIAL_ASSETS, INITIAL_CHART_DATA) and network configs
- **components/**: 20+ React components handling UI layout (Sidebar, Dashboard, TradingChart, etc.)
- **services/**: External integrations (Gemini AI via geminiService.ts, TradingView candlestick data)

### Key Data Flows
1. **Mock Data**: Mock assets, pairs, and orders flow from constants → App.tsx state
2. **Market Data**: Binance API (1h candles) in App.tsx + legacy TradingView service in src/services
3. **AI Advisor**: User questions → Gemini 2.5 Flash (contextData param includes market state)
4. **Auth**: JWT token resolver checks localStorage then document cookies (getCookieValue utility)
5. **TotalBalance**: Calculated as sum of `actual_usd` field for coins where `actual_usd > 0` (represents only actual holdings, excludes pending orders)

## Build & Test

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 3000, 0.0.0.0)
npm test                 # Run Vitest
npm run build            # Production build
```

**Environment Variables** (.env.local):
- `VITE_GEMINI_API_KEY`: Google GenAI key (required for AI Advisor)
- `VITE_API_DOMAIN`: Backend API (defaults to https://detidex.yeuthich.net)
- `VITE_DEBUG`: Set to 'true' for verbose logging

**Note**: Vite proxies `/api/*` calls to `VITE_API_DOMAIN` during dev to avoid CORS.

## Component Patterns

### State Lifting to App.tsx
App.tsx holds shared state (pairs, assets, orders, view, walletAddresses). Components receive props + callbacks:
```tsx
<Dashboard 
  assets={assets} 
  pairs={pairs} 
  onFastSwap={(from, to, amount) => { /* update state */ }}
  walletAddresses={walletAddresses}
  onGenerateAddress={(symbol, networkId, standard) => { /* update state */ }}
/>
```

### Modal State Management
Modal handling in components (e.g., Dashboard) uses local useState for visibility/steps:
```tsx
const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
```

### Memo & Callback Optimization
Components wrap with `React.memo()` and use `useCallback()` to prevent unnecessary re-renders when parent updates.

### PortfolioAsset Structure
```tsx
interface PortfolioAsset {
  symbol: string;           // e.g., 'BTC', 'ETH'
  name: string;             // e.g., 'Bitcoin', 'Ethereum'
  amount: number;           // actual + pending orders total
  valueUsd: number;         // (actual + orders) * price
  actual_usd?: number;      // actual balance value in USD (actual * price, orders excluded)
  color: string;            // brand color for UI
}
```
**Note**: `totalBalance` sums only `actual_usd` where `actual_usd > 0` (excludes pending orders).

## Styling & Theming

- **Tailwind CSS** with dark mode (`dark:` prefix)
- **Brand Colors**: `deti-primary` (primary), `deti-surface` (background), `deti-card` (elevated surfaces)
- **Lucide Icons**: Use `lucide-react` for all icons (no custom SVGs)
- **Dark Mode**: Default is true; toggle in header and propagate via props

**Example**:
```tsx
<div className={`bg-white text-black dark:bg-deti-surface dark:text-white`}>
  <Sparkles className="text-deti-primary" />
</div>
```

## Key Import Paths

- **Services**: 
  - `../services/geminiService` (getMarketInsight)
  - `../src/services/tradingview` (getKlines) — also re-exported from `../services/tradingview` for backward compat
- **Types**: `../types` (AppView, MarketPair, Order, etc.)
- **Constants**: `../constants` (MOCK_PAIRS, INITIAL_ASSETS, COIN_NETWORKS)
- **Components**: `../components/ComponentName`

## Crypto Network & Address Handling

Networks defined in constants (CryptoNetwork type: id, name, standard, fee, arrivalTime, minWithdraw).

**Address Generation** (App.tsx helper):
- TRC20 → `T` + 33 random alphas
- ERC20/BEP20/Arbitrum → `0x` + 40 random hex
- BTC → `bc1q` + 38 random alphas  
- SOL → 44 random alphas

## Service Integration Patterns

### Gemini AI (getMarketInsight)
- **Lazy loads** @google/genai SDK to avoid browser errors if API key missing
- Returns placeholder string if no key configured
- System prompt context: "You are DETI AI, a specialized crypto market analyst..."
- Model: gemini-2.5-flash

### Binance API (fetchBinanceData in App.tsx)
- Fetches 1h candles (100 limit) for symbol
- Transforms `[timestamp, open, high, low, close, volume]` into ChartDataPoint[]
- Gracefully logs errors and returns empty array on failure

### Balance Fetch Flow (App.tsx)
**Endpoint**: `/api/v1/balance/` (GET with Bearer token)

**API Response Structure**:
```json
{
  "balance": {
    "BTC": {
      "actual": 4.99394703,
      "orders": 1.0,
      "actual_usd": 439328.71,  // ← Key field for portfolio value
      "price": 87970.63,
      "price_24h": 0.09,
      "price_24h_value": 82.50
    },
    "ETH": { ... },
    "TRX": { ... }
  }
}
```

**Processing Steps**:
1. **Fetch**: `GET /api/v1/balance/` with auth token
2. **Normalize**: Extract `data.balance` or use raw data
3. **Store**: `setBalancesMap(normalized)` - stores complete balance object
4. **Calculate**: `Object.values(balancesMap).reduce((sum, coin) => sum + (coin.actual_usd || 0), 0)`
5. **Display**: Pass `calculatedTotalFromBalance` to Dashboard as `portfolioBalance` prop

**Key Fields**:
- `actual`: Actual coin amount (not including pending orders)
- `orders`: Amount in pending buy/sell orders
- `actual_usd`: Actual holdings value in USD (actual * price) - **PRIMARY SOURCE FOR PORTFOLIO VALUE**
- `price`: Current coin price in USD

**Asset Mapping** (Line 470-490):
```tsx
const mappedAssets: PortfolioAsset[] = Object.entries(balancesMap)
  .map(([sym, val]: any) => {
    const actualUsd = Number(val?.actual_usd) || 0;  // ← Use API value directly
    return {
      symbol: sym,
      actual_usd: actual_usd,  // Store for Dashboard calculations
      amount: actual + orders,
      valueUsd: (actual + orders) * price,
      ...
    };
  });
```

**Total Balance Calculation** (Line 107-111):
```typescript
const calculatedTotalFromBalance = Object.values(balancesMap).reduce((sum, coin: any) => {
  return sum + (Number(coin?.actual_usd) || 0);
}, 0);
// Result passed to Dashboard.portfolioBalance prop
```

## Common Tasks

### Add a New View
1. Add enum value to `AppView` in types.ts
2. Create component in components/ (follow memo + callback pattern)
3. Import in App.tsx and add to view routing logic
4. Update Sidebar/BottomNav with navigation

### Connect New Crypto Network
1. Add entry to COIN_NETWORKS in constants.ts
2. Update address generation logic in App.tsx if new standard needed
3. Pass walletAddresses state to Dashboard/Wallet components

### Modify Market Pair Display
1. Update MockPair interface fields in types.ts if needed
2. Modify MOCK_PAIRS in constants.ts
3. Adjust component rendering (e.g., MarketTicker, OrderBook, TradingChart)

### Debug API Issues
Set `VITE_DEBUG=true` env var. App.tsx logs masked tokens and auth source to console.

## Known Quirks & Fixes

- **Service Import Paths**: `../services/tradingview` re-exports `../src/services/tradingview` for compatibility
- **Auth Token Resolver**: Checks localStorage (keys: jwt, token, jwt_auth_token) then cookies (jwt, jwt_front)
- **Gemini API**: Module dynamically imports to prevent bundler issues in browser
- **Dark Mode**: Tailwind classes + optional isDarkMode prop on components
