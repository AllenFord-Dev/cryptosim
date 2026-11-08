import type { Quote } from "./coins";
import type { State } from "./store";

// A real dip: a coin you own is down 5% or more from what you paid, and you haven't faced this one yet.
export const DIP = 0.05;

export function activeMoment(state: State, quotes: Record<string, Quote>) {
  for (const [id, h] of Object.entries(state.holdings)) {
    if (id === "usd-coin" || h.qty <= 0) continue;
    const price = quotes[id]?.price;
    if (!price) continue;
    const avg = h.cost / h.qty;
    const change = (price - avg) / avg;
    if (change <= -DIP && state.moments?.[id] !== h.lastBuyAt) {
      return { coin: id, change, avg, price, value: h.qty * price, cost: h.cost, at: h.lastBuyAt };
    }
  }
  return null;
}
