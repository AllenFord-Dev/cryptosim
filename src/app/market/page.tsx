"use client";

import Link from "next/link";
import { useState } from "react";
import { PriceSource } from "@/components/bits";
import { HistoryIcon, SparkleIcon } from "@/components/icons";
import { HeaderButton, TabScreen, useUI } from "@/components/shell";
import { CoinMark, Spark } from "@/components/ui";
import { COINS, coinById, pct, qtyFmt, usd } from "@/lib/coins";
import { portfolio } from "@/lib/portfolio";
import { usePrices } from "@/lib/prices";
import { useApp } from "@/lib/store";

type Filter = "all" | "owned" | "gainers" | "losers" | "stable";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "owned", label: "Your coins" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "stable", label: "Stablecoins" },
];

const priceFmt = (p: number) => usd(p, p < 1 ? 4 : p < 10 ? 3 : 2);

export default function Market() {
  const { state } = useApp();
  const { quotes } = usePrices();
  const { openHistory, openBuddy } = useUI();
  const [filter, setFilter] = useState<Filter>("all");
  const p = portfolio(state, quotes);
  const flat = Math.abs(p.result) < 0.005;
  const up = p.result >= 0;

  const change = (id: string) => quotes[id]?.change24h ?? 0;
  const movers = COINS.filter((c) => c.kind !== "Stablecoin" && quotes[c.id])
    .sort((a, b) => Math.abs(change(b.id)) - Math.abs(change(a.id)))
    .slice(0, 5);

  let list = COINS;
  if (filter === "owned") list = COINS.filter((c) => state.holdings[c.id]);
  if (filter === "gainers") list = COINS.filter((c) => c.kind !== "Stablecoin" && change(c.id) > 0).sort((a, b) => change(b.id) - change(a.id));
  if (filter === "losers") list = COINS.filter((c) => c.kind !== "Stablecoin" && change(c.id) < 0).sort((a, b) => change(a.id) - change(b.id));
  if (filter === "stable") list = COINS.filter((c) => c.kind === "Stablecoin");

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
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-muted">Your portfolio</div>
              <div className="tabular text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em]">{usd(p.value)}</div>
              <div className={`tabular text-[14px] font-bold ${flat ? "text-muted" : up ? "text-up" : "text-down"}`}>
                {flat ? "—" : up ? "▲" : "▼"} {usd(Math.abs(p.result))} ({Math.abs(p.resultPct).toFixed(1)}%){" "}
                <span className="font-medium text-muted">from the market</span>
              </div>
            </div>
            <div className="pb-1 text-right">
              <div className="text-[12px] font-semibold text-muted">Buying power</div>
              <div className="tabular text-[16px] font-extrabold">{usd(state.cash)}</div>
            </div>
          </div>
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter coins">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`h-9 shrink-0 rounded-full px-4 text-[14px] font-bold transition-colors ${
                  filter === f.id ? "bg-ink text-card" : "bg-bg text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {filter === "all" && movers.length > 0 && (
        <section className="pt-5" aria-labelledby="movers">
          <h2 id="movers" className="px-5 text-[20px] font-extrabold tracking-[-0.02em]">
            Top movers today
          </h2>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 pt-3 [scrollbar-width:none]">
            {movers.map((c) => {
              const ch = change(c.id);
              return (
                <Link key={c.id} href={`/coin/${c.id}`} className="flex w-[132px] shrink-0 flex-col gap-2.5 rounded-[18px] border border-line p-3.5">
                  <CoinMark id={c.id} size={30} />
                  <div>
                    <div className="text-[14px] font-bold">{c.symbol}</div>
                    <div className={`tabular text-[20px] font-extrabold tracking-[-0.02em] ${ch >= 0 ? "text-up" : "text-down"}`}>{pct(ch)}</div>
                  </div>
                  <Spark values={quotes[c.id]?.spark.slice(-14) ?? []} w={100} h={24} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {filter === "all" && p.positions.length > 0 && (
        <section className="pt-6" aria-labelledby="yours">
          <h2 id="yours" className="px-5 text-[20px] font-extrabold tracking-[-0.02em]">
            Your coins
          </h2>
          <div className="pt-1">
            {p.positions.map((pos) => {
              const c = coinById(pos.id)!;
              return (
                <Row
                  key={pos.id}
                  id={pos.id}
                  sub={`${qtyFmt(pos.qty)} ${c.symbol}`}
                  value={usd(pos.value)}
                  detail={`${pos.gain >= 0 ? "+" : "−"}${usd(Math.abs(pos.gain))}`}
                  tone={Math.abs(pos.gain) < 0.005 ? "flat" : pos.gain >= 0 ? "up" : "down"}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="pt-6" aria-labelledby="prices">
        <div className="flex items-baseline justify-between px-5">
          <h2 id="prices" className="text-[20px] font-extrabold tracking-[-0.02em]">
            {filter === "all" ? "Prices" : FILTERS.find((f) => f.id === filter)!.label}
          </h2>
          <span className="text-[12px] font-semibold text-muted">24h</span>
        </div>
        <div className="pt-1">
          {list.length === 0 && (
            <p className="px-5 py-6 text-[15px] text-muted">
              {filter === "owned" ? "You don't own any coins yet. Tap a coin to make your first practice trade." : "Nothing here right now."}
            </p>
          )}
          {list.map((c) => {
            const q = quotes[c.id];
            const ch = change(c.id);
            const stable = c.kind === "Stablecoin";
            return (
              <Row
                key={c.id}
                id={c.id}
                sub={stable ? `${c.symbol} · Stablecoin` : c.kind === "Meme coin" ? `${c.symbol} · Meme coin` : c.symbol}
                value={q ? priceFmt(q.price) : "—"}
                detail={stable ? "0.0%" : pct(ch)}
                tone={stable || Math.abs(ch) < 0.05 ? "flat" : ch >= 0 ? "up" : "down"}
                spark={q?.spark.slice(-14)}
              />
            );
          })}
        </div>
      </section>

      <div className="px-5 pt-5">
        <button
          onClick={() => openBuddy("volatile")}
          className="flex w-full items-center gap-3 rounded-[18px] bg-brand-tint px-4 py-3.5 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
            <SparkleIcon size={20} color="var(--color-brand)" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">Why do prices swing so much?</span>
            <span className="block text-[13px] text-muted">Ask Buddy before your first trade</span>
          </span>
        </button>
        <div className="pt-4">
          <PriceSource />
        </div>
      </div>
    </TabScreen>
  );
}

function Row({
  id,
  sub,
  value,
  detail,
  tone,
  spark,
}: {
  id: string;
  sub: string;
  value: string;
  detail: string;
  tone: "up" | "down" | "flat";
  spark?: number[];
}) {
  const c = coinById(id)!;
  return (
    <Link href={`/coin/${id}`} className="flex items-center gap-3 px-5 py-3 transition-colors active:bg-bg">
      <CoinMark id={id} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-bold">{c.name}</div>
        <div className="truncate text-[13px] text-muted">{sub}</div>
      </div>
      {spark && spark.length > 1 && <Spark values={spark} w={60} h={26} />}
      <div className="w-[92px] text-right">
        <div className="tabular text-[15px] font-extrabold">{value}</div>
        <div className={`tabular text-[13px] font-bold ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-muted"}`}>{detail}</div>
      </div>
    </Link>
  );
}
