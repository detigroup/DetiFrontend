# Changelog - Balance API & UI/UX Improvements

## [Unreleased] - 2025-12-31

### Changed - Latest UI Refinements (Session 2)

#### 9. Auth Modal: Forgot Password Placement & Simplified reCAPTCHA
**Problem**: Forgot Password link sat above the Log In button; reCAPTCHA block showed extra helper text.

**Solution**:
- **`components/AuthModal.tsx`** (login form section):
  - Moved "Forgot Password" link to below the Log In button with spacing (`mt-2`).
  - reCAPTCHA block now shows only the checkbox + label "I'M NOT A ROBOT" (removed helper copy).
  - General form errors now display just above the submit button for clarity.

#### 10. Auth Modal: Remove "Please check I'm not a robot" Helper
**Problem**: Residual helper text "Please check 'I'M NOT A ROBOT' to enable the Sign In button." still appeared when unchecked.

**Solution**:
- **`components/AuthModal.tsx`**: Removed the conditional helper text under the submit button; checkbox state still controls button disabled state.

#### 11. Auth Modal: Remove Login Subtitle
**Problem**: Subtitle "Enter your credentials and verify the reCAPTCHA to enable the Sign In button." still showed in login mode.

**Solution**:
- **`components/AuthModal.tsx`**: Suppress subtitle in login mode; keep subtitle only for register view.

#### 12. Header/Sidebar: Remove Home Button & Mini Logo
**Problem**: Extra Home button and small outer logo cluttered the top/side UI.

**Solution**:
- **`components/TopBar.tsx`**: Removed Home button next to logo.
- **`components/Sidebar.tsx`**: Removed top logo block to hide small outer logo.

#### 8. Search Box & Deposit Button Theme Consistency
**Problem**: Search box and Deposit button styling inconsistent with dark/light mode theme.

**Solution**:
- **`components/TopBar.tsx`** (lines ~38-44):
  - Search box background: `bg-deti-card/30` → `bg-white/5 dark:bg-white/5`
  - Border visibility: `border-white/5` → `border-white/10`
  - Focus state: `focus:border-deti-primary/30` → `focus:border-deti-primary/50`
  - Border radius: `rounded-lg` → `rounded-xl`
  - Icon opacity: increased from `/60` to full visibility
  - Added hover state: `hover:bg-white/10`
  - Padding: `py-2` → `py-2.5` for better visual weight

- **`components/Dashboard.tsx`** (lines ~157-162):
  - Deposit button: `bg-white text-black` → `bg-deti-primary text-white`
  - Hover state: `hover:bg-gray-200` → `hover:bg-deti-primary/90`
  - Result: consistent branded primary color across all action buttons

#### 5. Search Box Redesign
**Problem**: Search box too large and visually overwhelming in TopBar.

**Solution**:
- **`components/TopBar.tsx`** (lines ~40-48):
  - Reduced max-width: `max-w-lg` → `max-w-md`
  - Smaller icon: 20px → 16px with lower opacity (`text-deti-subtext/60`)
  - Compact input: `py-3` → `py-2`, font size to `text-sm`
  - Border radius: `rounded-2xl` → `rounded-lg`
  - Lighter background: `bg-deti-card/50` → `bg-deti-card/30`
  - Simplified placeholder: "Search coin, pair, or feature..." → "Search..."

#### 6. Quick Convert Removal
**Problem**: Quick Convert card took up too much space and duplicated Convert button functionality.

**Solution**:
- **`components/Dashboard.tsx`**:
  - Removed entire Quick Convert card (lg:col-span-8 section)
  - Removed swap input forms, amount state, handleSwap logic
  - Balance card now spans full width (removed lg:grid-cols-12 layout)
  - Simplified grid to single column

#### 7. Action Buttons Layout Optimization
**Problem**: 4 action buttons (Deposit, Withdraw, Transfer, Convert) in 2x2 grid with inconsistent spacing.

**Solution**:
- **`components/Dashboard.tsx`** (lines ~125-165):
  - Moved buttons from top/middle to bottom of Balance card
  - Changed layout: `grid-cols-2` → `grid-cols-4` (single row)
  - Repositioned Quick Stats above buttons (reversed order)
  - Added `mt-auto` and `border-t` to buttons section for visual separation
  - Reduced button padding and icon size: `py-3` + `size={18}` → `py-3` + `size={16}` + `text-sm`
  - Result: cleaner hierarchy (Balance → Stats → Actions)

---

### Fixed - Balance API Integration & Authorization

#### 1. Token Storage & Retrieval
**Problem**: Authorization header missing in `/api/v1/balance/` requests; token stored in HttpOnly cookie unreadable by JavaScript.

**Solution**:
- **`components/AuthModal.tsx`** (lines ~180-200):
  - After successful login, extract primary token from response fields (`token`, `access`, `access_token`, `jwt`, `jwt_auth_token`)
  - Store token in localStorage (`jwt`, `token`, `jwt_auth_token`) and JS-readable cookie (`jwt_front`)
  - Ensures token availability for client-side Authorization headers

- **`App.tsx`** (lines ~40-50):
  - Added `resolveAuthToken()` helper: prioritizes localStorage → `jwt_front` cookie → `jwt` cookie
  - Returns token source for debugging
  - Added `maskToken()` helper for secure logging

#### 2. Balance Fetch Authorization
**Problem**: Balance requests failed with CORS errors and missing Authorization header.

**Solution**:
- **`App.tsx`** (Wallet fetch effect ~310-350 & refreshBalances ~400-460):
  - Use `resolveAuthToken()` to get token with fallback chain
  - Set `Authorization: Bearer ${token}` header when token present
  - Skip request with warning if no token found
  - Debug logging (when `VITE_DEBUG=true`) shows token source, masked values

#### 3. CORS Resolution via Proxy
**Problem**: Browser blocked requests due to CORS preflight failures.

**Solution**:
- **`vite.config.ts`** (lines ~8-16):
  - Added dev server proxy: `/api` routes to `VITE_API_DOMAIN` (default: `https://detidex.yeuthich.net`)
  - Configuration: `changeOrigin: true`, `secure: false`
  
- **`App.tsx`** (balance fetch paths ~313, ~408):
  - Detect localhost:3000/3001 and use relative `/api/v1/balance/` path
  - Falls back to full domain path for production

#### 4. Balance Data Normalization
**Problem**: API response wrapped balance data in nested `balance` or `balances` key.

**Solution**:
- **`App.tsx`** (balance fetch ~340, refreshBalances ~445):
  - Unwrap: `const normalized = data.balance || data.balances || data`
  - Map only coins with `(actual + orders) > 0`
  - Remove fallback merge with existing assets (no longer show DETI or coins not in response)

#### 5. Debug Infrastructure
**Files**: `App.tsx`
- Added `isDebug` flag from `VITE_DEBUG` env var
- Conditional logging shows:
  - Request URL
  - Headers (including Authorization)
  - Token source (localStorage/cookie)
  - Masked token values (first 6 + last 4 chars)

---

### Added - UI/UX Post-Login Improvements

#### 1. Logo & Navigation Enhancement
**`components/TopBar.tsx`** (lines ~20-30):
- Increased logo size: `h-8` → `h-10` (visible on all screens, not just mobile)
- Added Home button next to logo:
  - Icon + label "Home"
  - Hidden on mobile (`hidden sm:inline-flex`)
  - Calls `onHomeClick` prop to navigate to Dashboard
  
**`App.tsx`** (TopBar usage ~580):
- Pass `onHomeClick={() => setView(AppView.DASHBOARD)}`

#### 2. Dashboard Balance Card - New Actions
**`components/Dashboard.tsx`** (lines ~100-130):
- Added **Transfer** button (2x2 grid layout on mobile, 4 buttons on desktop)
- Added **Convert** button
- Grid adjusted: `grid-cols-2` with `col-span-2 lg:col-span-1` for new buttons
- Icons: `ArrowRightLeft` (Transfer), `RefreshCw` (Convert)

#### 3. Portfolio Analytics Removal
**`components/Dashboard.tsx`**:
- Removed:
  - Portfolio Analytics chart card (recharts AreaChart)
  - Mock data array (`data = [...]`)
  - Chart dependencies from imports (`AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
  - `BarChart2` icon import
  
- Adjusted layout:
  - Grid changed from `lg:col-span-4 / lg:col-span-5 / lg:col-span-3` 
  - To `lg:col-span-4 / lg:col-span-8` (Balance + Quick Convert cards)

#### 4. Asset Filtering Logic
**`App.tsx`** (lines ~380-390, ~450-465):
- Balance mapping now filters coins: `.filter(([sym, val]) => (actual + orders) > 0)`
- Removed `existingNotInBalances` merge (no longer show coins not in API response)
- Result: Wallet shows only coins with balance > 0 from backend

---

### Configuration

#### Environment Variables
- `VITE_DEBUG=true`: Enable verbose balance request logging
- `VITE_API_DOMAIN`: Backend URL (default: `https://detidex.yeuthich.net`)
- `VITE_LOGIN_API`: Login endpoint path (default: `/api/v1/auth/login/`)
- `VITE_COINS_API`: Coins list endpoint (default: `/api/v1/coins/`)

#### Dev Server
- Port: 3000 (configurable via `PORT=3000`)
- Proxy active for `/api/*` routes during local development

---

### Git

#### Branch: `dev`
- Commit: `feat: balance proxy and token fixes`
- Files changed: 20 (2971 insertions, 205 deletions)
- New files:
  - `.env`
  - `DOCS/tradingview.md`
  - `balance-fix.patch`
  - `components/ErrorBoundary.tsx`
  - `services/tradingview.ts`
  - `src/components/ErrorBoundary.tsx`
  - `src/services/tradingview.test.ts`
  - `src/services/tradingview.ts`

#### Remote
- Origin: `https://github.com/detigroup/DetiFrontend.git`
- Branch pushed: `origin/dev`
- PR link: `https://github.com/detigroup/DetiFrontend/pull/new/dev`

---

### Testing Checklist

- [x] Token persisted to localStorage after login
- [x] Authorization header present in `/api/v1/balance/` requests
- [x] CORS resolved via Vite proxy on localhost:3000
- [x] Balance data correctly unwrapped from nested response
- [x] Only coins with balance > 0 displayed in Wallet
- [x] Logo visible and larger on all screens
- [x] Home button navigates to Dashboard
- [x] Transfer and Convert buttons visible on Balance card
- [x] Portfolio Analytics chart removed
- [x] Dev server starts on port 3000 consistently

---

### Known Issues & Next Steps

#### Pending
- [ ] Implement actual Transfer/Convert modal flows (currently placeholder)
- [ ] Add toast notifications for balance fetch errors
- [ ] Skeleton loading states for Wallet table
- [ ] KYC/2FA status display in TopBar user menu
- [ ] Token expiry handling with "Session expired" banner

#### Future Enhancements
- Search/filter coins in Wallet table
- Sort by Available/Value columns
- Network indicator badges (ERC20/BEP20) for multi-chain coins
- Deposit/Withdraw fee/limit display in modals
- Real-time balance updates via WebSocket
