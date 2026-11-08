"use client";

import { useState } from "react";
import { CoinRow, PriceSource, holdingSub } from "@/components/bits";
import { HistoryIcon } from "@/components/icons";
import { HeaderButton, TabScreen } from "@/components/shell";
import { Sheet } from "@/components/ui";
import { COINS, coinById, qtyFmt, usd } from "@/lib/coins";
import { portfolio } from "@/lib/portfolio";
import { usePrices } from "@/lib/prices";
import { useApp } from "@/lib/store";

export default function Market() {
  const { state } = useApp();
  const { quotes } = usePrices();
  const [history, setHistory] = useState(false);
  const p = portfolio(state, quotes);
  const up = p.result >= 0;
  const flat = Math.abs(p.result) < 0.005;

  return (
    <TabScreen
      title="Market"
      right={
        <HeaderButton label="Trade history" onClick={() => setHistory(true)}>
          <HistoryIcon />
        </HeaderButton>
      }
      hero={
        <div className="px-6 pb-4 pt-4">
          <div className="text-[14px] font-semibold text-muted">Portfolio</div>
          <div className="tabular text-[38px] font-extrabold leading-[1.1] tracking-[-0.03em]">{usd(p.value)}</div>
          <div className={`tabular text-[14px] font-bold ${flat ? "text-muted" : up ? "text-up" : "text-down"}`}>
            {flat ? "—" : up ? "▲" : "▼"} {usd(Math.abs(p.result))} ({Math.abs(p.resultPct).toFixed(1)}%){" "}
            <span className="font-medium text-muted">from the market, after fees</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-0.5 rounded-[14px] bg-bg px-3.5 py-3">
              <span className="text-[12px] font-semibold text-muted">Buying power</span>
              <span className="tabular text-[18px] font-extrabold">{usd(state.cash)}</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-[14px] bg-bg px-3.5 py-3">
              <span className="text-[12px] font-semibold text-muted">In coins</span>
              <span className="tabular text-[18px] font-extrabold">{usd(p.invested)}</span>
            </div>
          </div>
          <p className="pt-3 text-[12px] leading-[1.45] text-muted">
            Gains and losses reflect the market, not your skill. Rewards from missions go to buying power and aren&apos;t counted as gains.
          </p>
        </div>
      }
    >
      {p.positions.length > 0 && (
        <div className="rounded-[20px] bg-white px-4 pb-1.5 pt-3.5">
          <div className="pb-1 text-[16px] font-extrabold">Your coins</div>
          {p.positions.map((pos, i) => (
            <CoinRow
              key={pos.id}
              id={pos.id}
              sub={`${holdingSub(pos.id, pos.qty)} · ${pos.gain >= 0 ? "+" : "−"}${usd(Math.abs(pos.gain))}`}
              value={usd(pos.value)}
              change={pos.change24h}
              last={i === p.positions.length - 1}
            />
          ))}
        </div>
      )}
      <div className="rounded-[20px] bg-white px-4 pb-1.5 pt-3.5">
        <div className="flex items-baseline justify-between pb-1">
          <span className="text-[16px] font-extrabold">All coins</span>
          <span className="text-[12px] font-semibold text-muted">24h</span>
        </div>
        {COINS.map((c, i) => {
          const q = quotes[c.id];
          return (
            <CoinRow
              key={c.id}
              id={c.id}
              sub={c.kind === "Stablecoin" ? `${c.symbol} · Stablecoin` : `${c.symbol} · ${c.kind}`}
              value={q ? usd(q.price, q.price < 10 ? 2 : 0) : "—"}
              change={q?.change24h ?? 0}
              last={i === COINS.length - 1}
            />
          );
        })}
      </div>
      <PriceSource />

      <Sheet open={history} onClose={() => setHistory(false)} title="Trade history">
        {state.trades.length === 0 ? (
          <p className="pb-4 text-[15px] text-muted">No trades yet. Pick a coin to make your first practice trade.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {state.trades.map((t) => {
              const c = coinById(t.coin)!;
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold">
                      {t.side === "buy" ? "Bought" : "Sold"} {c.name}
                    </div>
                    <div className="text-[12px] text-muted">
                      {new Date(t.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · fee{" "}
                      {usd(t.fee)}
                      {t.feeChecked ? " · checked fees" : ""}
                      {t.panic ? " · quick sell at a loss" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-[14px] font-extrabold">{usd(t.usd)}</div>
                    <div className="tabular text-[12px] text-muted">
                      {qtyFmt(t.qty)} {c.symbol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Sheet>
    </TabScreen>
  );
}
