// Lightweight TradingView adapter for DetiFrontend
// Provides: getKlines(pairSymbol, timeframe, limit)
import { ChartDataPoint } from '../types';

type Frame = 'minute' | 'hour' | 'day';

const FRAME_MAP: Record<string, Frame> = {
  '1m': 'minute',
  '15m': 'minute',
  '1h': 'hour',
  '4h': 'hour',
  'D': 'day',
  'W': 'day'
};

const MS_PER_FRAME: Record<Frame, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

function mapToFrame(tf: string): Frame {
  return FRAME_MAP[tf] || 'minute';
}

function defaultApiBase() {
  // Use Vite env var if provided (import.meta.env.VITE_API_DOMAIN), fallback to production domain
  try {
    const domain = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
    return String(domain).replace(/\/$/, '');
  } catch (_e) {
    return 'https://detidex.yeuthich.net';
  }
}

function resolveJwtToken(): string {
  try {
    const cookieJwt = typeof document !== 'undefined' ? (document.cookie.split(';').find(c => c.trim().startsWith('jwt=')) || '').split('=')[1] || '' : '';
    return localStorage.getItem('jwt') || localStorage.getItem('token') || localStorage.getItem('jwt_auth_token') || cookieJwt || '';
  } catch (_e) {
    return '';
  }
}

export async function getKlines(pairSymbol: string, timeframe: string = '1h', limit: number = 200): Promise<ChartDataPoint[]> {
  const frame = mapToFrame(timeframe);
  const ms = MS_PER_FRAME[frame];
  const stop_ts = Date.now();
  const start_ts = stop_ts - limit * ms;

  const apiBase = defaultApiBase();
  const url = `${apiBase}/api/v1/stats/`;
  const token = resolveJwtToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = {
    pair: pairSymbol.replace('/', '-'), // backend expects 'BTC-USDT'
    start_ts,
    stop_ts,
    frame
  };

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include' });
    const data = await res.json();
    if (!data || !Array.isArray(data.records)) return [];

    // Backend records are [ts, max_price, min_price, amount, open_price, close_price]
    let bars: ChartDataPoint[] = mapRecordsToBars(data.records);

    // Support 15m and 4h aggregations client-side by grouping smaller frames
    if (timeframe === '15m' && frame === 'minute') {
      bars = aggregateBars(bars, 15 * 60 * 1000);
    }
    if (timeframe === '4h' && frame === 'hour') {
      bars = aggregateBars(bars, 4 * 60 * 60 * 1000);
    }

    // For display convenience convert ISO time to locale string
    return bars.map(b => ({ ...b, time: new Date(b.time).toLocaleString() }));
  } catch (err) {
    // fallback: return empty
    // eslint-disable-next-line no-console
    console.warn('getKlines failed', err);
    return [];
  }
}

export function mapRecordsToBars(records: any[]): ChartDataPoint[] {
  return (records || []).map((r: any) => ({
    time: new Date(Number(r[0])).toISOString(),
    open: Number(r[4]) || 0,
    high: Number(r[1]) || 0,
    low: Number(r[2]) || 0,
    close: Number(r[5]) || 0,
    volume: Number(r[3]) || 0,
  })) as ChartDataPoint[];
}

export function aggregateBars(bars: ChartDataPoint[], windowMs: number): ChartDataPoint[] {
  if (!bars || bars.length === 0) return bars;
  // Sort ascending by timestamp
  const sorted = [...bars].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const result: ChartDataPoint[] = [];
  let bucketStart = Math.floor(new Date(sorted[0].time).getTime() / windowMs) * windowMs;
  let bucket: ChartDataPoint | null = null;

  for (const b of sorted) {
    const t = new Date(b.time).getTime();
    const bucketKey = Math.floor(t / windowMs) * windowMs;
    if (bucket === null || bucketKey !== bucketStart) {
      if (bucket) result.push(bucket);
      bucketStart = bucketKey;
      bucket = { time: new Date(bucketKey).toISOString(), open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume };
    } else {
      // merge
      bucket.high = Math.max(bucket.high, b.high);
      bucket.low = Math.min(bucket.low, b.low);
      bucket.close = b.close;
      bucket.volume = (bucket.volume || 0) + (b.volume || 0);
    }
  }
  if (bucket) result.push(bucket);
  return result;
}

export default {
  getKlines,
};

// --- WebSocket subscription support (simple) ---
type Unsubscribe = () => void;

export function subscribeLiveKlines(
  pairSymbol: string,
  timeframe: string,
  onUpdate: (bars: ChartDataPoint[]) => void,
  intervalMs: number = 30_000,
): Unsubscribe {
  const apiBase = defaultApiBase();
  const wsBase = apiBase ? apiBase.replace(/^http/, 'ws') : (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
  const wsUrl = `${wsBase.replace(/\/$/, '')}/ws/live_notifications`;

  let ws: WebSocket | null = null;
  let poll: number | null = null;
  let closed = false;

  function sendGetChart() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const stop_ts = Date.now();
    const frame = mapToFrame(timeframe);
    const ms = MS_PER_FRAME[frame];
    const start_ts = stop_ts - 200 * ms;
    const payload = { command: 'get_chart', params: { pair: pairSymbol.replace('/', '-'), start_ts, stop_ts, frame } };
    ws.send(JSON.stringify(payload));
  }

  try {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      sendGetChart();
      poll = window.setInterval(sendGetChart, intervalMs);
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg && Array.isArray(msg.records)) {
          const bars = msg.records.map((r: any) => ({
            time: new Date(Number(r[0])).toLocaleString(),
            open: Number(r[4]) || 0,
            high: Number(r[1]) || 0,
            low: Number(r[2]) || 0,
            close: Number(r[5]) || 0,
            volume: Number(r[3]) || 0,
          }));
          onUpdate(bars);
        }
      } catch (e) {
        // ignore
      }
    };
    ws.onclose = () => {
      if (poll) { clearInterval(poll); poll = null; }
    };
    ws.onerror = () => {
      // swallow
    };
  } catch (e) {
    // ignore open failures
  }

  return () => {
    if (closed) return;
    closed = true;
    if (poll) { clearInterval(poll); poll = null; }
    if (ws) { try { ws.close(); } catch (e) {} }
  };
}
