"use client";

import Link from "next/link";
import { useState } from "react";
import { PriceSource } from "@/components/bits";
import { HistoryIcon } from "@/components/icons";
import { HeaderButton, TabScreen, useUI } from "@/components/shell";
import { CoinMark, Spark } from "@/components/ui";
import { COINS, coinById, pct, qtyFmt, usd } from "@/lib/coins";
import { portfolio } from "@/lib/portfolio";
import { usePrices } from "@/lib/prices";
import { useApp } from "@/lib/store";

type Filter = "all" | "owned" | "stable";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All coins" },
  { id: "owned", label: "Your coins" },
  { id: "stable", label: "Stablecoins" },
];

const priceFmt = (p: number) => usd(p, p < 1 ? 4 : p < 10 ? 3 : 2);

// Market: plain rows with live prices and a quick Buy on each. Your plan's coin comes first.
export default function Market() {
  const { state } = useApp();
  const { quotes } = usePrices();
  const { openHistory } = useUI();
  const [filter, setFilter] = useState<Filter>("all");
  const p = portfolio(state, quotes);
  const flat = Math.abs(p.result) < 0.005;
  const up = p.result >= 0;
  const planCoin = state.plan?.coin ?? null;

  let list = [...COINS];
  if (filter === "owned") list = COINS.filter((c) => state.holdings[c.id]);
  if (filter === "stable") list = COINS.filter((c) => c.kind === "Stablecoin");
  if (planCoin) list.sort((a, b) => Number(b.id === planCoin) - Number(a.id === planCoin));

  return (
    <TabScreen
      title="Market"
      tone="white"
      right={
        <HeaderButton label="Trade history" onClick={openHistory}>
          <HistoryIcon />
        </HeaderButton>
      }
      hero={
        <div className="px-5 pt-4">
          <div className="tabular text-[40px] font-extrabold leading-none tracking-[-0.04em]">{usd(p.value)}</div>
          <div className={`tabular pt-2 text-[14px] font-bold ${flat ? "text-muted" : up ? "text-up" : "text-down"}`}>
            {flat ? "—" : up ? "▲" : "▼"} {usd(Math.abs(p.result))} ({Math.abs(p.resultPct).toFixed(Math.abs(p.resultPct) < 0.1 ? 2 : 1)}%) <span className="font-medium text-muted">from the market</span>
          </div>
          <div className="tabular pt-1 text-[14px] font-semibold text-muted">{usd(state.cash)} buying power</div>
          <div className="mt-5 flex gap-2" role="tablist" aria-label="Filter coins">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`h-9 rounded-full px-4 text-[14px] font-bold ${filter === f.id ? "bg-ink text-card" : "bg-bg text-ink"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <section aria-label={FILTERS.find((f) => f.id === filter)!.label} className="px-5 pt-3">
        <div className="border-t border-line">
          {list.length === 0 && <p className="py-6 text-[15px] text-muted">You don&apos;t own any coins yet. Tap Buy on any coin to start.</p>}
          {list.map((c) => {
            const q = quotes[c.id];
            const ch = q?.change24h ?? 0;
            const stable = c.kind === "Stablecoin";
            const h = state.holdings[c.id];
            const tone = stable || Math.abs(ch) < 0.05 ? "text-muted" : ch >= 0 ? "text-up" : "text-down";
            const sub = c.id === planCoin ? "Your plan" : h ? `${qtyFmt(h.qty)} ${c.symbol}` : stable ? "Stablecoin" : c.symbol;
            return (
              <div key={c.id} className="flex items-center gap-3 border-b border-line py-3">
                <Link href={`/coin/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <CoinMark id={c.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold">{c.name}</span>
                    <span className={`block truncate text-[12.5px] ${c.id === planCoin ? "font-bold text-brand" : "text-muted"}`}>{sub}</span>
                  </span>
                  {q && q.spark.length > 1 && <Spark values={q.spark.slice(-14)} />}
                  <span className="w-[76px] text-right">
                    <span className="tabular block text-[14px] font-extrabold">{q ? priceFmt(q.price) : "—"}</span>
                    <span className={`tabular block text-[12px] font-bold ${tone}`}>{stable ? "0.0%" : pct(ch)}</span>
                  </span>
                </Link>
                <Link href={`/coin/${c.id}?buy=1`} className="flex h-9 items-center rounded-full bg-brand-tint px-3.5 text-[14px] font-extrabold text-brand" aria-label={`Buy ${coinById(c.id)?.name}`}>
                  Buy
                </Link>
              </div>
            );
          })}
        </div>
      </section>
      <div className="px-5 pt-4">
        <PriceSource />
      </div>
    </TabScreen>
  );
}
