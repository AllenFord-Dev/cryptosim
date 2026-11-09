"use client";

import { usd } from "@/lib/coins";
import { usePrices } from "@/lib/prices";
import { FEE_RATE, SPREAD_RATE } from "@/lib/store";
import { CoinMark } from "./ui";

// Opens the guided first trade: a sheet that previews the three moments as real pieces of the app,
// so it's clear a walkthrough is starting. Required, so there's no close button.
const TRADE = 20;

export function TourIntro({ onStart }: { onStart: () => void }) {
  const { quotes } = usePrices();
  const price = quotes.bitcoin?.price;
  const fee = TRADE * FEE_RATE;
  const spread = (TRADE - fee) * (SPREAD_RATE / (1 + SPREAD_RATE));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your first trade"
      className="onb-enter fixed inset-0 z-[70] mx-auto flex max-w-[430px] flex-col bg-card px-5 pb-[calc(20px+var(--safe-bottom))] pt-[calc(16px+var(--safe-top))]"
    >
      {/* The three moments of the first trade, centered in the space above the text. */}
      <div className="flex flex-1 items-center justify-center" aria-hidden>
        <div className="relative h-[260px] w-full max-w-[340px] overflow-hidden rounded-[28px] bg-brand-tint">
          <span className="absolute bottom-12 left-[46px] top-16 border-l-2 border-dashed border-track" />
          <Frag className="left-5 top-6 w-[250px]">
            <CoinMark id="bitcoin" size={34} />
            <span>
              <b className="block text-[14px] font-extrabold">Bitcoin</b>
              <span className="block text-[12px] text-muted">{price ? usd(price, 0) : "Live"} · real price</span>
            </span>
          </Frag>
          <Frag className="left-16 top-[104px] w-[250px]">
            <span className="flex-1">
              <span className="block text-[12px] text-muted">Fees and spread</span>
              <b className="tabular block text-[14px] font-extrabold">{usd(fee + spread)}</b>
            </span>
            <span className="text-[12px] font-extrabold text-up">Checked</span>
          </Frag>
          <Frag className="left-8 top-[184px] w-[270px] !bg-[#12111A] text-white">
            <span>
              <span className="block text-[12px] text-white/60">Practice trade</span>
              <b className="block text-[14px] font-extrabold">Bought ${TRADE} of BTC</b>
            </span>
          </Frag>
        </div>
      </div>
      <div className="text-[13px] font-bold text-brand">Tutorial · Part 1 of 3</div>
      <h2 className="pt-1 text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em]">Your first trade</h2>
      <p className="pt-2 text-[16px] leading-[1.45] text-body">
        A quick guided tour: your first trade, a first send, then your plan. About 7 minutes. First, buy ${TRADE} of Bitcoin with practice money.
        We&apos;ll point to each tap.
      </p>
      <button onClick={onStart} className="btn btn-brand mt-6">
        Start
      </button>
    </div>
  );
}

function Frag({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute flex items-center gap-2.5 rounded-[16px] bg-card px-3.5 py-3 shadow-[0_10px_26px_-12px_rgba(30,20,70,0.35)] ${className}`}>
      {children}
    </div>
  );
}
