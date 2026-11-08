"use client";

import { useState } from "react";
import { COINS } from "@/lib/coins";
import { useApp } from "@/lib/store";
import { CoinMark } from "./ui";

// Asked once after the guided first trade: the real purchase this practice is for.
const CHOICES = ["bitcoin", "ethereum", "solana"];

export function PlanSetup({ onDone }: { onDone?: () => void }) {
  const { state, dispatch } = useApp();
  const [coin, setCoin] = useState<string | null>(state.plan?.coin ?? "bitcoin");
  const [amount, setAmount] = useState(String(state.plan?.amount ?? 100));
  const n = Math.round(parseFloat(amount) || 0);
  const save = (plan: { coin: string | null; amount: number } | null) => {
    dispatch({ type: "plan", plan });
    onDone?.();
  };
  return (
    <div className="onb-enter fixed inset-0 z-[65] mx-auto flex max-w-[430px] flex-col bg-card pb-[calc(16px+var(--safe-bottom))] pt-[calc(8px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-end px-2">
        <button onClick={() => save(state.plan)} className="h-11 px-4 text-[15px] font-semibold text-muted">
          Skip
        </button>
      </div>
      <div className="flex-1 px-6 pt-2">
        <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em]">What&apos;s the first real crypto you&apos;re thinking about buying?</h1>
        <p className="pt-3 text-[16px] leading-[1.45] text-muted">We&apos;ll shape your practice around it. You can change it anytime.</p>
        <div className="flex flex-wrap gap-2 pt-6" role="radiogroup" aria-label="Coin">
          {CHOICES.map((id) => {
            const c = COINS.find((x) => x.id === id)!;
            const on = coin === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={on}
                onClick={() => setCoin(id)}
                className={`flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] py-1.5 pl-1.5 pr-4 text-[15px] font-bold ${on ? "border-brand bg-brand-tint text-brand" : "border-track"}`}
              >
                <CoinMark id={id} size={30} />
                {c.name}
              </button>
            );
          })}
          <button
            role="radio"
            aria-checked={coin === null}
            onClick={() => setCoin(null)}
            className={`min-h-[44px] rounded-full border-[1.5px] px-4 text-[15px] font-bold ${coin === null ? "border-brand bg-brand-tint text-brand" : "border-track"}`}
          >
            Not sure yet
          </button>
        </div>
        <label className="block pt-8">
          <span className="text-[15px] font-bold text-muted">Roughly how much?</span>
          <span className="mt-2 flex items-baseline border-b-2 border-brand pb-1">
            <span className="text-[44px] font-bold text-muted">$</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              className="tabular w-full bg-transparent text-[52px] font-extrabold tracking-[-0.04em]"
              style={{ outline: "none" }}
              aria-label="Amount in dollars"
            />
          </span>
        </label>
      </div>
      <div className="px-5">
        <button disabled={n < 1} onClick={() => save({ coin, amount: n })} className="btn btn-brand">
          Save my plan
        </button>
      </div>
    </div>
  );
}

export function planLabel(plan: { coin: string | null; amount: number } | null) {
  if (!plan) return null;
  const c = plan.coin ? COINS.find((x) => x.id === plan.coin)?.name : null;
  return `$${plan.amount.toLocaleString("en-US")}${c ? ` of ${c}` : " of crypto"}`;
}
