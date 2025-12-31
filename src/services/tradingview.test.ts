import { describe, it, expect } from 'vitest';
import { aggregateBars, mapRecordsToBars } from './tradingview';

describe('tradingview service', () => {
  it('maps backend records to ChartDataPoint', () => {
    const ts = 1700000000000; // arbitrary timestamp
    const records = [
      [ts, 102, 98, 1000, 100, 101],
      [ts + 60000, 103, 99, 1200, 101, 102],
    ];
    const bars = mapRecordsToBars(records);
    expect(bars.length).toBe(2);
    expect(bars[0].open).toBe(100);
    expect(bars[0].high).toBe(102);
    expect(bars[0].low).toBe(98);
    expect(bars[0].close).toBe(101);
    expect(bars[0].volume).toBe(1000);
  });

  it('aggregates minute bars into 15m buckets', () => {
    const startRaw = 1700000000000; // base
    const windowMs = 15 * 60 * 1000;
    const start = Math.floor(startRaw / windowMs) * windowMs; // align to 15m
    // generate 15 1-minute bars
    const minuteBars = [] as any[];
    for (let i = 0; i < 15; i++) {
      const t = start + i * 60000;
      minuteBars.push({ time: new Date(t).toISOString(), open: 100 + i, high: 100 + i + 2, low: 100 + i - 1, close: 100 + i + 1, volume: 10 });
    }
    const agg = aggregateBars(minuteBars as any, 15 * 60 * 1000);
    expect(agg.length).toBe(1);
    expect(agg[0].open).toBe(100);
    // high should be highest among highs
    expect(agg[0].high).toBe(100 + 14 + 2);
    // low should be lowest among lows
    expect(agg[0].low).toBe(100 - 1);
    // close should be close of last bar
    expect(agg[0].close).toBe(100 + 14 + 1);
    // volume should sum
    expect(agg[0].volume).toBe(15 * 10);
  });
});
