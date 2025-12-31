TradingView-style Klines Integration

Overview
- We added a lightweight TradingView adapter in `src/services/tradingview.ts`.
- `getKlines(pairSymbol, timeframe, limit)` requests candle history from the backend stats endpoint (`POST /api/v1/stats/`) and maps responses to `ChartDataPoint[]` used by `TradingChart`.
- The adapter supports client-side aggregation for `15m` and `4h` timeframes.
- A simple WebSocket subscription helper `subscribeLiveKlines` is available to receive `get_chart` messages from the backend if `VITE_USE_WS=true`.

How to enable
- Set `VITE_API_DOMAIN` in your environment to point to the backend (e.g. `https://detidex.yeuthich.net`).
- To enable WebSocket updates set `VITE_USE_WS=true` in your env; client will connect to `<api>/ws/live_notifications` and send `get_chart` commands.

Notes
- Backend `StatsView` expects `frame` to be one of `minute`, `hour`, `day`. The adapter maps common timeframes (`1m/15m` -> `minute`, `1h/4h` -> `hour`, `D/W` -> `day`).
- For 15m and 4h the client aggregates smaller bars into requested windows when backend doesn't provide those exact buckets.

Files touched
- `src/services/tradingview.ts` (new)
- `src/components/TradingChart.tsx` (fetch/polling/optional ws)

Next steps
- Add unit tests for aggregation and mapping
- Optionally add a more robust WS reconnection/backoff strategy
- Expose timeframe selection to parent component if you want global sync
