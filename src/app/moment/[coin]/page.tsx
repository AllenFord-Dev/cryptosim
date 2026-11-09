"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { go } from "@/lib/nav";
import { useState } from "react";
import { SparkleIcon } from "@/components/icons";
import { AreaChart } from "@/components/ui";
import { coinById, usd } from "@/lib/coins";
import { activeMoment, momentKey } from "@/lib/moments";
import { useHistory, usePrices } from "@/lib/prices";
import { useApp } from "@/lib/store";

const REASON: Record<string, string> = { long: "long-term", curious: "trying it out", hype: "something you saw hyped" };

// Market moment: a real dip in a coin you own. Decide, and Buddy holds you to your own plan.
export default function MomentPage() {
  const { coin: id } = useParams<{ coin: string }>();
  const coin = coinById(id);
  const { state, dispatch } = useApp();
  const { quotes } = usePrices();
  const history = useHistory(7, coin ? [coin.id] : []);
  const [held, setHeld] = useState<boolean | null>(null);
  const m = activeMoment(state, quotes);
  const h = state.holdings[id];
  const lastBuy = state.trades.find((t) => t.coin === id && t.side === "buy" && t.reason);

  // Wait for the live price before deciding whether there's a real dip here.
  if (coin && h && !quotes[id] && held === null) return <div className="min-h-[var(--app-h)] bg-card" />;
  // Only a real, unfaced dip in this coin opens the moment (you can't visit it to farm credit).
  if (!coin || !h || (held === null && m?.coin !== id)) {
    return (
      <div className="min-h-[var(--app-h)] bg-card p-6 pt-[calc(24px+var(--safe-top))]">
        <p className="text-[16px]">Nothing to decide here right now.</p>
        <Link href="/" className="btn btn-brand mt-6">
          Back home
        </Link>
      </div>
    );
  }
  const price = quotes[id]?.price ?? h.lastBuyPrice;
  const avg = h.cost / h.qty;
  const change = m?.coin === id ? m.change : (price - avg) / avg;
  const value = h.qty * price;
  const down = h.cost - value;
  // Start the line at what you paid, then real prices since you bought.
  const raw = history?.[id] ?? quotes[id]?.spark ?? [];
  const since = Math.max(0, Math.floor(raw.length * (1 - Math.min(1, (Date.now() - h.lastBuyAt) / (7 * 864e5)))));
  const series = raw.length > 1 ? [avg, ...raw.slice(since), price] : [];
  const recurringHere = state.recurring?.coin === id;

  const decide = (hold: boolean) => {
    dispatch({ type: "moment", coin: id, at: momentKey(state, id), held: hold });
    if (hold) setHeld(true);
    else go(`/coin/${id}?sell=1`);
  };

  return (
    <div className="flex min-h-[var(--app-h)] flex-col bg-card pb-[calc(20px+var(--safe-bottom))] pt-[calc(6px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-between px-3">
        <Link href="/" aria-label="Close" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[16px] font-bold">Market moment</span>
        <span className="w-11" />
      </div>
      <div className="px-5 pt-2">
        <div className="text-[15px] font-semibold text-muted">{coin.name} since you bought</div>
        <div className={`tabular text-[48px] font-extrabold leading-none tracking-[-0.04em] ${change < 0 ? "text-down" : "text-up"}`}>
          {change < 0 ? "−" : "+"}
          {Math.abs(change * 100).toFixed(1)}%
        </div>
        <div className="tabular pt-1.5 text-[14px] font-semibold text-muted">
          {usd(h.cost)} → {usd(value)} · real prices
        </div>
      </div>
      <div className="pt-4">{series.length > 1 && <AreaChart values={series} height={120} color="var(--color-down)" />}</div>

      {held ? (
        <div className="anim-enter flex flex-1 flex-col px-5 pt-6">
          <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.025em]">You held.</h1>
          <p className="pt-2 text-[16px] leading-[1.5] text-body">
            Selling now would have locked in a {usd(Math.max(0, down))} loss plus fees. Holding means the result is still up to the market, which is what a long-term plan expects.
          </p>
          <div className="flex-1" />
          <Link href="/" className="btn btn-brand">
            Done
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-5 pt-5">
          <h1 className="text-[23px] font-extrabold tracking-[-0.02em]">What do you do?</h1>
          <div className="mt-3 border-t border-line">
            <Choice onClick={() => decide(true)}>Hold. My plan was long-term</Choice>
            <Choice onClick={() => decide(false)}>Sell before it drops more</Choice>
            {recurringHere && <Choice onClick={() => decide(true)}>Let my recurring buy keep going</Choice>}
          </div>
          {lastBuy && (
            <div className="mt-5 rounded-[16px] bg-brand-tint px-3.5 py-3 text-[15px] leading-[1.42] text-body">
              <div className="flex items-center gap-1.5 pb-1 text-[13px] font-extrabold text-brand">
                <SparkleIcon size={16} color="currentColor" /> Buddy
              </div>
              Your plan said <b className="font-extrabold text-ink">{REASON[lastBuy.reason!] ?? "long-term"}</b>
              {lastBuy.okLoss ? (
                <>
                  {" "}
                  and you were OK losing <b className="font-extrabold text-ink">${lastBuy.okLoss}</b>
                </>
              ) : null}
              . You&apos;re down {usd(Math.max(0, down))}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Choice({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex min-h-[58px] w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left text-[16px] font-bold active:bg-bg">
      {children}
      <span className="text-[20px] text-faint">›</span>
    </button>
  );
}
