import { STARTING_CASH, State } from "./store";
import type { Quote } from "./coins";

export function portfolio(state: State, quotes: Record<string, Quote>, history?: Record<string, number[]> | null) {
  const positions = Object.entries(state.holdings).map(([id, h]) => {
    const q = quotes[id];
    const price = q?.price ?? h.lastBuyPrice;
    const value = h.qty * price;
    return { id, qty: h.qty, cost: h.cost, value, gain: value - h.cost, change24h: q?.change24h ?? 0, quote: q };
  });
  positions.sort((a, b) => b.value - a.value);
  const invested = positions.reduce((s, p) => s + p.value, 0);
  const value = state.cash + invested;
  // Market result excludes practice rewards and mission losses, so it only reflects the market (and fees).
  const base = STARTING_CASH + state.earned - state.lost;
  const result = value - base;
  const resultPct = base > 0 ? (result / base) * 100 : 0;

  // Chart: what the current holdings were worth over the selected range.
  const src = (id: string) => history?.[id] ?? quotes[id]?.spark ?? [];
  const len = Math.max(0, ...positions.map((p) => src(p.id).length));
  const series: number[] = [];
  for (let i = 0; i < len; i++) {
    let v = state.cash;
    for (const p of positions) {
      const s = src(p.id);
      if (s.length === 0) {
        v += p.value;
        continue;
      }
      const idx = Math.min(s.length - 1, Math.max(0, s.length - len + i));
      v += p.value * (s[idx] / (s[s.length - 1] || 1));
    }
    series.push(v);
  }
  return { positions, invested, value, result, resultPct, series };
}
