"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PriceSource } from "@/components/bits";
import { SparkleIcon } from "@/components/icons";
import { useUI } from "@/components/shell";
import { TradeSheet } from "@/components/trade";
import { RecurringSheet, recurringLabel } from "@/components/recurring";
import { Coach } from "@/components/coach";
import { AreaChart, CoinMark, RangeTabs, SubHeader } from "@/components/ui";
import { coinById, pct, qtyFmt, usd } from "@/lib/coins";
import { RANGES, RangeKey, useHistory, usePrices } from "@/lib/prices";

const RANGE_LABEL: Record<RangeKey, string> = { "1D": "past day", "1W": "past week", "1M": "past month", "3M": "past 3 months", "1Y": "past year" };
import { useApp } from "@/lib/store";

export default function CoinPage() {
  const { id } = useParams<{ id: string }>();
  const coin = coinById(id);
  const { state, dispatch, ready } = useApp();
  useEffect(() => {
    if (state.tour === "coin") dispatch({ type: "tour", step: "buy" });
  }, [state.tour, dispatch]);
  const { quotes } = usePrices();
  const { openBuddy } = useUI();
  const [trade, setTrade] = useState<"buy" | "sell" | null>(null);
  const [recurring, setRecurring] = useState(false);
  // Deep links from Market practice: ?buy=1, ?sell=1, ?recurring=1 (applied once saved progress has loaded).
  const linked = useRef(false);
  useEffect(() => {
    if (!ready || linked.current) return;
    linked.current = true;
    const q = new URLSearchParams(window.location.search);
    if (q.get("buy")) setTrade("buy");
    else if (q.get("sell") && state.holdings[id]) setTrade("sell");
    else if (q.get("recurring")) setRecurring(true);
  }, [ready, id, state.holdings]);
  const [range, setRange] = useState<RangeKey>("1M");
  const history = useHistory(RANGES.find((r) => r.key === range)!.days, coin ? [coin.id] : []);

  if (!coin) {
    return (
      <div className="p-6">
        <SubHeader back="/market" />
        <p className="pt-6 text-[16px]">We couldn&apos;t find that coin.</p>
      </div>
    );
  }

  const q = quotes[coin.id];
  const h = state.holdings[coin.id];
  const stable = coin.kind === "Stablecoin";
  const spark = q?.spark ?? [];
  const series = (coin && history?.[coin.id]) ?? spark;
  const rangeChange = series.length > 1 ? ((series[series.length - 1] - series[0]) / series[0]) * 100 : 0;
  const value = h && q ? h.qty * q.price : 0;
  const gain = h ? value - h.cost : 0;
  const tone = stable || Math.abs(rangeChange) < 0.05 ? "text-muted" : rangeChange >= 0 ? "text-up" : "text-down";

  return (
    <div className="min-h-[var(--app-h)] bg-card pb-[130px]">
      <SubHeader back="/market" />
      <div className="flex items-center gap-3 px-5 pt-1">
        <CoinMark id={coin.id} size={40} />
        <div>
          <h1 className="text-[20px] font-extrabold leading-tight">{coin.name}</h1>
          <div className="text-[13px] font-semibold text-muted">
            {coin.symbol} · {coin.kind}
          </div>
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="tabular text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em]">{q ? usd(q.price, q.price < 10 ? 4 : 2) : "—"}</div>
        <div className={`tabular pt-1 text-[14px] font-bold ${tone}`}>
          {stable ? "Designed to stay at $1.00" : `${pct(rangeChange)} `}
          {!stable && <span className="font-medium text-muted">{RANGE_LABEL[range]}</span>}
        </div>
      </div>
      <div className="pt-4">{series.length > 1 && <AreaChart values={series} height={150} />}</div>
      <RangeTabs value={range} options={RANGES.map((r) => r.key)} onChange={setRange} />

      {h && (
        <section aria-labelledby="pos" className="px-5 pt-7">
          <h2 id="pos" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
            Your position
          </h2>
          <div className="border-t border-line">
            <Stat label="Value" value={usd(value)} />
            <Stat label="You own" value={`${qtyFmt(h.qty)} ${coin.symbol}`} />
            <Stat label="You paid, including fees" value={usd(h.cost)} />
            <Stat
              label="Gain or loss"
              value={`${gain >= 0 ? "+" : "−"}${usd(Math.abs(gain))}`}
              tone={Math.abs(gain) < 0.005 ? undefined : gain >= 0 ? "text-up" : "text-down"}
            />
          </div>
        </section>
      )}

      {!stable && (
        <div className="px-5 pt-6">
          <button onClick={() => setRecurring(true)} className="flex min-h-[54px] w-full items-center justify-between gap-4 border-y border-line py-3 text-left text-[16px]">
            <span className="font-semibold text-muted">Recurring buy</span>
            <span className="font-bold text-brand">
              {state.recurring?.coin === coin.id ? `${recurringLabel(state.recurring)} ›` : "Set up ›"}
            </span>
          </button>
        </div>
      )}

      <section aria-labelledby="about" className="px-5 pt-7">
        <h2 id="about" className="text-[18px] font-extrabold tracking-[-0.015em]">
          About {coin.name}
        </h2>
        <p className="pt-2 text-[15px] leading-[1.5] text-body">{coin.about}</p>
        <button onClick={() => openBuddy(stable ? "stablecoin" : "volatile")} className="mt-3 flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-brand">
          <SparkleIcon size={18} color="currentColor" />
          {stable ? "What's a stablecoin?" : "Why does the price swing so much?"}
        </button>
      </section>
      <div className="px-5 pt-4">
        <PriceSource />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] gap-2.5 px-4 pb-[calc(14px+var(--safe-bottom))]">
        {h && (
          <button onClick={() => setTrade("sell")} className="btn btn-ghost flex-1 shadow-[0_8px_24px_rgba(18,17,26,0.10)]" disabled={!q}>
            Sell
          </button>
        )}
        <button
          data-coach="buy"
          onClick={() => {
            if (state.tour === "buy") dispatch({ type: "tour", step: "fees" });
            setTrade("buy");
          }}
          className="btn btn-brand flex-1 shadow-[0_8px_24px_rgba(85,33,245,0.28)]" disabled={!q}>
          Buy
        </button>
      </div>

      {state.tour === "buy" && !trade && (
        <Coach target="buy" radius={999} step={2} total={3} title="Tap Buy" body="You&apos;ll pick an amount next. Nothing real is bought." />
      )}
      {recurring && <RecurringSheet coinId={coin.id} onClose={() => setRecurring(false)} />}
      {q && trade && <TradeSheet coinId={coin.id} side={trade} price={q.price} onClose={() => setTrade(null)} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-4 border-b border-line py-3 text-[16px]">
      <span className="font-semibold text-muted">{label}</span>
      <span className={`tabular font-extrabold ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
