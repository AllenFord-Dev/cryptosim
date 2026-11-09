import type { MarketStep, State } from "./store";

// The Market practice half: done in the real market, with live prices, around the user's own plan.
export type MarketStepDef = { id: MarketStep; title: string; sub: string; href: string; live?: boolean };

export function marketSteps(state: State): MarketStepDef[] {
  const plan = state.plan?.coin ?? "bitcoin";
  const owned = Object.keys(state.holdings).find((id) => id !== "usd-coin");
  return [
    { id: "planned", title: "Buy with a plan", sub: "Say why, and what you could lose", href: `/coin/${plan}?buy=1` },
    { id: "small", title: "Keep it small", sub: "Keep one coin under 25% of your money", href: `/coin/${plan}?buy=1` },
    { id: "recurring", title: "Set a recurring buy", sub: "A little, on a schedule, on real prices", href: `/coin/${plan}?recurring=1` },
    { id: "parked", title: "Park in a stablecoin", sub: "Move some into USDC instead of cashing out", href: "/coin/usd-coin?buy=1" },
    { id: "reasoned", title: "Sell with a reason", sub: owned ? "Sell part of a coin, and say why" : "Buy a coin first, then sell part of it", href: owned ? `/coin/${owned}?sell=1` : `/coin/${plan}?buy=1` },
    { id: "dip", title: "Hold through a real dip", sub: "Counts when the market dips", href: "/market", live: true },
  ];
}

export function marketProgress(state: State) {
  const steps = marketSteps(state);
  const core = steps.filter((s) => !s.live);
  const done = core.filter((s) => state.market?.[s.id]).length;
  const next = core.find((s) => !state.market?.[s.id]) ?? null;
  return { steps, done, total: core.length, next };
}
