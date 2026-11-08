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
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your first trade">
      <div className="anim-dim absolute inset-0 bg-[rgba(18,17,26,0.45)]" />
      <div className="anim-sheet absolute inset-x-2 bottom-2 mx-auto max-w-[414px] rounded-[34px] bg-white px-5 pb-[calc(20px+var(--safe-bottom))] pt-5">
        <div className="relative h-[232px] overflow-hidden rounded-[24px] bg-[#F4F2FA]" aria-hidden>
          <span className="absolute bottom-10 left-[42px] top-14 border-l-2 border-dashed border-[#D6D1E6]" />
          <Frag className="left-4 top-5 w-[240px]">
            <CoinMark id="bitcoin" size={34} />
            <span>
              <b className="block text-[14px] font-extrabold">Bitcoin</b>
              <span className="block text-[12px] text-muted">{price ? usd(price, 0) : "Live"} · real price</span>
            </span>
          </Frag>
          <Frag className="left-14 top-[92px] w-[240px]">
            <span className="flex-1">
              <span className="block text-[12px] text-muted">Fees and spread</span>
              <b className="tabular block text-[14px] font-extrabold">{usd(fee + spread)}</b>
            </span>
            <span className="text-[12px] font-extrabold text-up">Checked</span>
          </Frag>
          <Frag className="left-7 top-[162px] w-[260px] !bg-ink text-white">
            <span>
              <span className="block text-[12px] text-white/60">Practice trade</span>
              <b className="block text-[14px] font-extrabold">Bought ${TRADE} of BTC</b>
            </span>
          </Frag>
        </div>
        <h2 className="pt-5 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em]">Your first trade</h2>
        <p className="pt-2 text-[15.5px] leading-[1.45] text-body">
          Buy ${TRADE} of Bitcoin with practice money. We&apos;ll point to each tap. About 2 minutes.
        </p>
        <button onClick={onStart} className="btn btn-brand mt-5">
          Start
        </button>
      </div>
    </div>
  );
}

function Frag({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute flex items-center gap-2.5 rounded-[16px] bg-white px-3.5 py-3 shadow-[0_10px_26px_-12px_rgba(30,20,70,0.35)] ${className}`}>
      {children}
    </div>
  );
}
