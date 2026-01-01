# Balance Fetch Data Flow - Code Review

## Overview
This document reviews the complete data flow for fetching and processing balance information from the backend API, transforming it into UI-displayable format, and calculating the Total Balance.

---

## 1. Data Fetch Phase

### Location: `App.tsx` Lines 330-380

```typescript
useEffect(() => {
  if (currentView !== AppView.WALLET && currentView !== AppView.DASHBOARD) return;
  let mounted = true;
  
  const fetchBalances = async () => {
    try {
      const domainEnv = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
      const isLocalHost = typeof window !== 'undefined' && /localhost:300[01]/.test(window.location.host);
      const apiBase = isLocalHost ? '' : String(domainEnv).replace(/\/$/, '');
      const url = `${apiBase}/api/v1/balance/`;
      
      const { token } = resolveAuthToken();
      if (!token) {
        console.warn('Skipping balance fetch: no auth token found');
        return;
      }
      
      const headers: Record<string, string> = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
      if (!mounted) return;
      if (!res.ok) return;
      
      const data = await res.json();
      // Normalize response - handle multiple possible response structures
      const normalized = (data && (data.balance || data.balances)) ? (data.balance || data.balances) : data;
      setBalancesMap(normalized || {});
      setBalancesLastUpdated(Date.now());
    } catch (err) {
      console.warn('Failed to fetch balances', err);
    }
  };
  
  fetchBalances();
  return () => { mounted = false; };
}, [currentView]);
```

### Key Points:
- ✅ Triggers when entering **DASHBOARD** or **WALLET** views
- ✅ Checks for auth token (localStorage or cookies)
- ✅ Normalizes API response (handles both `data.balance` and `data.balances`)
- ✅ Stores raw data in `setBalancesMap` state
- ✅ Uses `credentials: 'include'` for cookie-based auth

### API Response Expected:
```json
{
  "balance": {
    "BTC": {
      "actual": 4.99394703,
      "orders": 1.0,
      "actual_usd": 439328.71,
      "price": 87970.6392,
      "price_24h": 0.09387991,
      "price_24h_value": 82.5093
    },
    "ETH": {
      "actual": 102.0872927,
      "orders": 0.0,
      "actual_usd": 303917.8721897738,
      "price": 2977.8392,
      "price_24h": -0.0928583,
      "price_24h_value": -2.767
    },
    "TRX": {
      "actual": 10003.996,
      "orders": 0.0,
      "actual_usd": 2836.132866,
      "price": 0.2835,
      "price_24h": -0.7700385,
      "price_24h_value": -0.0022
    }
  }
}
```

---

## 2. Total Balance Calculation

### Location: `App.tsx` Lines 107-111

```typescript
// Calculate total balance directly from balancesMap (sum of actual_usd)
const calculatedTotalFromBalance = Object.values(balancesMap).reduce((sum, coin: any) => {
  return sum + (Number(coin?.actual_usd) || 0);
}, 0);
```

### Logic:
1. **Extract all balance objects** from `balancesMap`
2. **Sum only `actual_usd` fields** (excludes pending orders)
3. **Filter out invalid values** with `|| 0` fallback
4. **Result**: Single number = Total portfolio value in USD

### Example Calculation:
```
BTC: 439,328.71
ETH: 303,917.87
TRX: 2,836.13
─────────────
Total: 746,082.71 USD
```

---

## 3. Asset Mapping Phase

### Location: `App.tsx` Lines 468-498

```typescript
useEffect(() => {
  if (!balancesMap || Object.keys(balancesMap).length === 0) return;
  
  const mappedAssets: PortfolioAsset[] = Object.entries(balancesMap)
    .filter(([sym, val]: any) => {
      const actual = Number(val?.actual) || 0;
      const orders = Number(val?.orders) || 0;
      return (actual + orders) > 0;  // Only include coins with holdings
    })
    .map(([sym, val]: any) => {
      const symbol = sym;
      const actual = Number(val?.actual) || 0;
      const orders = Number(val?.orders) || 0;
      const actualUsd = Number(val?.actual_usd) || 0;  // ✅ Key: Use API value directly
      
      // Find market price for this symbol
      const pairMatch = pairs.find(p => p.base === symbol) 
        || pairs.find(p => p.symbol.startsWith(symbol + '/'));
      const price = pairMatch ? Number(pairMatch.price) : 0;
      
      const existing = assets.find(a => a.symbol === symbol);
      
      return {
        symbol,
        name: existing?.name || symbol,
        amount: actual + orders,           // Total: actual + pending
        valueUsd: (actual + orders) * price,  // Calculate from pairs
        actual_usd: actualUsd,             // Direct from API
        color: existing?.color || '#374151'
      } as PortfolioAsset;
    });
  
  setAssets(mappedAssets);
}, [balancesMap, pairs]);
```

### Processing Steps:
1. **Filter**: Remove coins with 0 holdings
2. **Map**: Transform each balance entry to `PortfolioAsset`
3. **Extract Fields**:
   - `actual`: Raw coin amount from API
   - `actual_usd`: USD value from API (this is the source of truth)
   - `price`: Look up from market pairs
   - `valueUsd`: Calculated for UI display
4. **Store**: Update `setAssets` state

### PortfolioAsset Structure:
```typescript
interface PortfolioAsset {
  symbol: string;           // e.g., 'BTC', 'ETH'
  name: string;             // e.g., 'Bitcoin', 'Ethereum'
  amount: number;           // actual + pending orders
  valueUsd: number;         // calculated: (actual + orders) * price
  actual_usd?: number;      // actual balance value in USD from API
  color: string;            // brand color for UI
}
```

---

## 4. Display in Dashboard

### Location: `components/Dashboard.tsx` Lines 44-52

```typescript
// Use portfolioBalance from App (calculated from balancesMap actual_usd)
// Fallback to calculated from assets if needed
const calculatedTotalBalance = assets
  .filter(asset => (asset.actual_usd || 0) > 0)
  .reduce((acc, curr) => acc + (curr.actual_usd || 0), 0);

const displayBalance = portfolioBalance > 0 ? portfolioBalance : calculatedTotalBalance;
```

### Then rendered:
```tsx
<span className="text-4xl lg:text-5xl font-bold text-white tracking-tight mt-1">
  {portfolioBalanceLoading ? (
    <span className="animate-pulse">Loading...</span>
  ) : (
    `$${displayBalance.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  )}
</span>
```

### Display Examples:
- Loading: "Loading..."
- Ready: "$746,082.71"

---

## 5. Props Flow

### App.tsx → Dashboard.tsx

```typescript
<Dashboard 
  portfolioBalance={calculatedTotalFromBalance}  // Main prop: sum of actual_usd
  portfolioBalanceLoading={portfolioBalanceLoading}
  assets={assets}  // For fallback calculation
  pairs={pairs}
  // ... other props
/>
```

---

## Key Design Decisions

### ✅ Using `actual_usd` from API
- **Why**: API already calculates USD value accurately
- **Benefit**: Single source of truth, no recalculation errors
- **Field**: `coin.actual_usd` from `/api/v1/balance/` response

### ✅ Excluding Pending Orders
- **Why**: Total Balance shows actual holdings, not pending trades
- **Implementation**: Only sum `actual_usd`, not `(actual + orders) * price`
- **Display**: Pending orders shown separately in Order Management

### ✅ Dual-layer Fallback
- **Primary**: Use `portfolioBalance` from App (from `balancesMap`)
- **Fallback**: Recalculate from `assets` if primary is 0
- **Benefit**: Resilient to API issues

---

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│ API: GET /api/v1/balance/               │
│ {balance: {BTC: {...}, ETH: {...}, ...}}│
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ normalize() → balancesMap state          │
│ {BTC: {actual: 4.99, actual_usd: 439k}, │
│  ETH: {actual: 102, actual_usd: 303k}}  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
[Calc Total]         [Asset Mapping]
sum(actual_usd)      Create PortfolioAsset[]
= 746,082.71         With actual_usd field
    │                     │
    └──────────┬──────────┘
               ▼
    ┌──────────────────────┐
    │ Dashboard Component  │
    │ Display: $746,082.71 │
    └──────────────────────┘
```

---

## Error Handling

### Fetch Errors:
```typescript
if (!token) {
  console.warn('Skipping balance fetch: no auth token found');
  return;  // Skip fetch
}

if (!res.ok) return;  // Silently skip on HTTP error

// Try-catch wraps entire fetch
try { ... } catch (err) {
  console.warn('Failed to fetch balances', err);
}
```

### Data Validation:
```typescript
// Safe number conversion
Number(val?.actual) || 0
Number(val?.actual_usd) || 0

// Filter out invalid entries
.filter(([sym, val]: any) => {
  const actual = Number(val?.actual) || 0;
  const orders = Number(val?.orders) || 0;
  return (actual + orders) > 0;  // Only positive balances
})
```

---

## Testing Checklist

- [ ] API returns `actual_usd` for each coin
- [ ] `balancesMap` state stores complete response
- [ ] `calculatedTotalFromBalance` correctly sums all `actual_usd`
- [ ] `mappedAssets` preserves `actual_usd` in each asset
- [ ] Dashboard displays correct total (no decimals in thousands)
- [ ] Loading state shows "Loading..." briefly
- [ ] Fallback calculation works if API returns 0
- [ ] Auth token rejection prevents fetch attempt
- [ ] Error in fetch doesn't crash app

---

## Performance Considerations

- ✅ **useEffect dependency**: `[currentView]` - refetch when navigating to DASHBOARD/WALLET
- ✅ **Memoization**: Consider `useMemo` for `calculatedTotalFromBalance` if balancesMap is large
- ✅ **Asset mapping**: Only runs when `balancesMap` or `pairs` change
- ⚠️ **Polling**: Currently no auto-refresh; consider adding interval for real-time updates

---

## Future Improvements

1. **Real-time Updates**: Add WebSocket or polling for live balance updates
2. **Balance History**: Track balance changes over time for P&L calculations
3. **Multi-currency**: Support other quote currencies beyond USD
4. **Caching**: Store fetched balances with TTL to reduce API calls
5. **Error Recovery**: Retry failed fetches with exponential backoff
