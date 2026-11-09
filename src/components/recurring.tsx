"use client";

import { useEffect, useState } from "react";
import { coinById, usd } from "@/lib/coins";
import { usePrices } from "@/lib/prices";
import { Recurring, useApp } from "@/lib/store";
import { Sheet } from "./ui";

const PERIOD: Record<Recurring["every"], number> = { day: 864e5, week: 7 * 864e5, month: 30 * 864e5 };
const LABEL: Record<Recurring["every"], string> = { day: "Daily", week: "Weekly", month: "Monthly" };

export function RecurringSheet({ coinId, onClose }: { coinId: string; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const coin = coinById(coinId)!;
  const current = state.recurring?.coin === coinId ? state.recurring : null;
  const [amount, setAmount] = useState(current?.amount ?? 10);
  const [every, setEvery] = useState<Recurring["every"]>(current?.every ?? "week");
  const other = state.recurring && state.recurring.coin !== coinId ? coinById(state.recurring.coin) : null;

  return (
    <Sheet open onClose={onClose} title="Recurring buy">
      <div className="text-[14px] font-bold text-muted">Amount</div>
      <div className="grid grid-cols-3 gap-2 pt-2" role="radiogroup" aria-label="Amount">
        {[5, 10, 25].map((v) => (
          <button key={v} role="radio" aria-checked={amount === v} onClick={() => setAmount(v)} className={`min-h-[44px] rounded-full text-[15px] font-bold ${amount === v ? "bg-ink text-card" : "bg-bg"}`}>
            ${v}
          </button>
        ))}
      </div>
      <div className="pt-5 text-[14px] font-bold text-muted">How often</div>
      <div className="grid grid-cols-3 gap-2 pt-2" role="radiogroup" aria-label="How often">
        {(["day", "week", "month"] as const).map((v) => (
          <button key={v} role="radio" aria-checked={every === v} onClick={() => setEvery(v)} className={`min-h-[44px] rounded-full text-[15px] font-bold ${every === v ? "bg-ink text-card" : "bg-bg"}`}>
            {LABEL[v]}
          </button>
        ))}
      </div>
      <div className="mt-5 border-t border-line">
        <div className="flex min-h-[50px] items-center justify-between border-b border-line text-[15px]">
          <span className="text-muted">First buy</span>
          <span className="font-bold">{current ? "Already running" : "Today"}</span>
        </div>
        <div className="flex min-h-[50px] items-center justify-between border-b border-line text-[15px]">
          <span className="text-muted">Uses</span>
          <span className="font-bold">Real {coin.name} prices</span>
        </div>
      </div>
      <p className="pt-3 text-[14px] leading-[1.45] text-muted">
        Buying a little on a schedule means you don&apos;t have to guess the right moment. Each buy happens the next time you open CryptoSim after it&apos;s due, and is skipped if you&apos;re short on practice cash.
        {other ? ` This replaces your ${other.name} recurring buy.` : ""}
      </p>
      <div className="flex flex-col gap-2.5 pt-5">
        <button
          onClick={() => {
            dispatch({ type: "recurring", recurring: { coin: coinId, amount, every, next: current?.next ?? Date.now(), runs: current?.runs ?? 0 } });
            onClose();
          }}
          className="btn btn-brand"
        >
          {current ? "Save changes" : `Start: ${usd(amount, 0)} ${LABEL[every].toLowerCase()}`}
        </button>
        {current && (
          <button
            onClick={() => {
              dispatch({ type: "recurring", recurring: null });
              onClose();
            }}
            className="btn btn-ghost"
          >
            Stop recurring buy
          </button>
        )}
      </div>
    </Sheet>
  );
}

// Runs any recurring buys that came due while the app was closed, at today's real price.
export function RecurringRunner() {
  const { state, dispatch, ready } = useApp();
  const { quotes } = usePrices();
  const r = state.recurring;
  const price = r ? quotes[r.coin]?.price : undefined;
  useEffect(() => {
    if (!ready || !r || !price || r.next > Date.now()) return;
    let next = r.next;
    let runs = r.runs;
    let cash = state.cash;
    for (let k = 0; k < 4 && next <= Date.now() && cash >= r.amount; k++) {
      dispatch({ type: "trade", coin: r.coin, side: "buy", usd: r.amount, price, feeChecked: true, auto: true });
      cash -= r.amount;
      next += PERIOD[r.every];
      runs++;
    }
    // A buy that comes due without enough practice cash is skipped, and the coin page says so.
    const short = next <= Date.now() && cash < r.amount;
    while (next <= Date.now()) next += PERIOD[r.every];
    dispatch({ type: "recurring", recurring: { ...r, next, runs, skipped: short ? Date.now() : runs > r.runs ? undefined : r.skipped } });
  }, [ready, r, price, state.cash, dispatch]);
  return null;
}

export const recurringLabel = (r: Recurring) => `${usd(r.amount, 0)} ${LABEL[r.every].toLowerCase()}`;
