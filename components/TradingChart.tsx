
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar, Cell } from 'recharts';
import { ChartDataPoint } from '../types';
// Fix REason: the tradingview adapter lives under `src/services` (not top-level `/services`),
// so adjust import path so Vite can resolve it correctly during dev/build.
import { getKlines } from '../src/services/tradingview';
import { 
  Maximize2, Settings, CandlestickChart, Activity, 
  Pencil, Type, ChevronDown, 
  Crosshair, Trash2, Ruler, BoxSelect
} from 'lucide-react';

interface TradingChartProps {
  data: ChartDataPoint[];
  symbol: string;
  isDarkMode?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Custom Tooltip
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const isUp = d.close >= d.open;
    return (
      <div className="bg-deti-card border border-deti-border p-2 rounded shadow-xl text-[10px] font-mono z-50">
        <div className="text-deti-subtext mb-1">{label}</div>
        <div className="flex gap-3">
          <span className="text-deti-subtext">O: <span className={isUp ? 'text-deti-success' : 'text-deti-danger'}>{d.open.toFixed(2)}</span></span>
          <span className="text-deti-subtext">H: <span className="text-deti-text">{d.high.toFixed(2)}</span></span>
          <span className="text-deti-subtext">L: <span className="text-deti-text">{d.low.toFixed(2)}</span></span>
          <span className="text-deti-subtext">C: <span className={isUp ? 'text-deti-success' : 'text-deti-danger'}>{d.close.toFixed(2)}</span></span>
        </div>
      </div>
    );
  }
  return null;
};

export const TradingChart: React.FC<TradingChartProps> = React.memo(({ data, symbol, isDarkMode = true }) => {
  const [timeframe, setTimeframe] = useState('1h');
  const [fetchedData, setFetchedData] = useState<ChartDataPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate domain for Y-axis scaling
  const allPrices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1;

  // Prefer fetched backend klines when available, else fallback to prop `data`
  const sourceData = fetchedData && fetchedData.length > 0 ? fetchedData : data;

  // Fetch klines from backend when symbol or timeframe changes
  useEffect(() => {
    let mounted = true;
    let unsubscribeWs: (() => void) | null = null;
    const doFetch = async () => {
      setIsLoading(true);
      const pairSymbol = symbol; // e.g. BTC/USDT
      try {
        const klines = await getKlines(pairSymbol, timeframe, 200);
        if (!mounted) return;
        if (klines && klines.length > 0) {
          setFetchedData(klines);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const useWs = (import.meta as any)?.env?.VITE_USE_WS === 'true';
    if (useWs) {
      // subscribe via websocket to get_chart messages
      // dynamic import to avoid errors in non-browser/no-ws environments
      // Fix REason: dynamic import path must point to actual location under `src`.
      import('../src/services/tradingview').then(mod => {
        unsubscribeWs = mod.subscribeLiveKlines(symbol, timeframe, (bars: ChartDataPoint[]) => {
          if (!mounted) return;
          setFetchedData(bars);
        });
      }).catch(() => doFetch());
    } else {
      doFetch();
      // Short polling for "minute" frames to keep last candle updated
      const pollInterval = timeframe === '1m' || timeframe === '15m' ? 30_000 : 60_000;
      const poll = setInterval(doFetch, pollInterval);
      return () => { mounted = false; clearInterval(poll); if (unsubscribeWs) unsubscribeWs(); };
    }
    return () => { mounted = false; if (unsubscribeWs) unsubscribeWs(); };
  }, [symbol, timeframe]);

  // Process data for Recharts
  const processedData = React.useMemo(() => sourceData.map(d => ({
    ...d,
    body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    isUp: d.close >= d.open
  })), [sourceData]);

  const axisColor = isDarkMode ? '#64748B' : '#64748B'; // Slate-500
  const gridColor = isDarkMode ? '#262935' : '#E2E8F0'; // deti-border

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      
      {/* 1. Top Toolbar (Header) */}
      <div className="flex items-center justify-between px-2 h-9 border-b border-deti-border bg-deti-card/80 backdrop-blur-sm relative z-20 shrink-0">
        <div className="flex items-center gap-1">
           {/* Timeframes */}
           {['1m', '15m', '1h', '4h', 'D', 'W'].map((t) => (
              <button 
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeframe === t ? 'text-deti-text bg-deti-border' : 'text-deti-subtext hover:text-deti-text hover:bg-deti-surface'}`}
              >
                {t}
              </button>
            ))}
            <button className="text-deti-subtext hover:text-deti-text px-1"><ChevronDown size={12}/></button>
           
           <div className="h-3 w-[1px] bg-deti-border mx-2"></div>
           
           <button className="p-1 text-deti-subtext hover:text-deti-text hover:bg-deti-surface rounded"><CandlestickChart size={14} /></button>
           
           <div className="h-3 w-[1px] bg-deti-border mx-2"></div>

           {/* Indicators */}
           <button className="flex items-center gap-1 text-[11px] font-bold text-deti-subtext hover:text-deti-text px-2 py-1 hover:bg-deti-surface rounded transition-colors">
              <Activity size={14} /> Indicators
           </button>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-1 text-deti-subtext hover:text-deti-text hover:bg-deti-surface rounded"><Settings size={14} /></button>
           <button className="p-1 text-deti-subtext hover:text-deti-text hover:bg-deti-surface rounded"><Maximize2 size={14} /></button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 min-h-0 relative z-10">
        
        {/* Left Drawing Toolbar */}
        <div className="w-10 border-r border-deti-border bg-deti-card/80 backdrop-blur-sm flex flex-col items-center py-2 gap-3 z-20 shrink-0">
          <ToolButton icon={<Crosshair size={16} />} />
          <ToolButton icon={<Pencil size={16} />} />
          <ToolButton icon={<Type size={16} />} />
          <ToolButton icon={<Ruler size={16} />} />
          <ToolButton icon={<BoxSelect size={16} />} />
          <div className="w-4 h-[1px] bg-deti-border"></div>
          <ToolButton icon={<Trash2 size={16} />} />
        </div>

        {/* Chart Canvas */}
        <div className="flex-1 relative bg-transparent overflow-hidden cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData} margin={{ top: 10, right: 60, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} vertical={true} horizontal={true} />
              
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: axisColor, fontSize: 10 }}
                minTickGap={60}
                height={30}
              />
              
              {/* Price Axis (Right) */}
              <YAxis 
                yAxisId="price"
                domain={[minPrice - padding, maxPrice + padding]} 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: axisColor, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(value) => value.toFixed(1)}
                width={60}
              />

              {/* Volume Axis (Left, hidden) */}
              <YAxis 
                yAxisId="volume"
                orientation="left"
                axisLine={false}
                tickLine={false}
                hide={true} 
              />

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: axisColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                isAnimationActive={false}
              />
              {/* Loading indicator (very small) */}
              {isLoading && (
                <text x={10} y={20} fill={axisColor} fontSize={11}>Updating…</text>
              )}

              {/* Volume Bars */}
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#3B404D" 
                opacity={0.3} 
                barSize={6}
                isAnimationActive={false}
              />

              {/* Candles */}
              <Bar 
                yAxisId="price"
                dataKey="body" 
                barSize={6} 
                minPointSize={2}
                isAnimationActive={false}
              >
                {processedData.map((entry, index) => (
                   <Cell 
                     key={`cell-${index}`} 
                     fill={entry.isUp ? '#2ebd85' : '#f6465d'} 
                   />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

const ToolButton = React.memo(({ icon }: { icon: React.ReactNode }) => (
  <button className="p-1.5 rounded-sm text-deti-subtext hover:text-deti-text hover:bg-deti-surface transition-all">
    {icon}
  </button>
));
