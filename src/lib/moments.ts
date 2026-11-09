import type { Quote } from "./coins";
import type { State } from "./store";

// A real dip: a coin you own is down 5% or more from what you paid, and you haven't faced this one yet.
export const DIP = 0.05;

// Which buy a dip is measured against: your own last buy of the coin. Recurring buys don't reset it,
// so a daily recurring buy can't bring the same moment back every day.
export function momentKey(state: State, id: string) {
  return state.trades.find((t) => t.coin === id && t.side === "buy" && !t.auto)?.at ?? state.holdings[id]?.lastBuyAt ?? 0;
}

export function activeMoment(state: State, quotes: Record<string, Quote>) {
  for (const [id, h] of Object.entries(state.holdings)) {
    if (id === "usd-coin" || h.qty <= 0) continue;
    const price = quotes[id]?.price;
    if (!price) continue;
    const avg = h.cost / h.qty;
    const change = (price - avg) / avg;
    const at = momentKey(state, id);
    if (change <= -DIP && state.moments?.[id] !== at) {
      return { coin: id, change, avg, price, value: h.qty * price, cost: h.cost, at };
    }
  }
  return null;
}
