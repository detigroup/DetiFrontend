// Fix REason: backward-compatible re-export
// Some components historically import from `../services/tradingview` (top-level services/).
// The canonical implementation lives in `src/services/tradingview.ts` — re-export here so both import styles work.
export * from '../src/services/tradingview';
