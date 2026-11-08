"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckIcon, ChevronIcon, SparkleIcon } from "@/components/icons";
import { CoinMark } from "@/components/ui";
import { chunk } from "@/lib/missions";
import { qtyFmt, usd } from "@/lib/coins";
import { usePrices } from "@/lib/prices";
import { FEE_RATE, SPREAD_RATE, useApp } from "@/lib/store";

// Required 2-minute starter: one guided trade, one guided send. Everything else unlocks after.
const STEPS = 7;
const REAL = "0x4c1e88a0d7b2f6e93a51c0d8e7f4b2a6c3d19f2b";
const FAKE = "0x4c1e5f09b3a7e1d2c8f60a4b9e3d7c1f5a209f2b";

export default function Start() {
  const { state, dispatch } = useApp();
  const { quotes } = usePrices();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [feesOpen, setFeesOpen] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [net, setNet] = useState<string | null>(null);
  const price = quotes.bitcoin?.price ?? 100000;
  const amt = 20;
  const fee = amt * FEE_RATE;
  const spread = (amt - fee) * (SPREAD_RATE / (1 + SPREAD_RATE));
  const qty = (amt - fee) / (price * (1 + SPREAD_RATE));
  const name = state.name || "there";
  const order = useMemo(() => [REAL, FAKE].sort(() => (Math.random() > 0.5 ? 1 : -1)), []);

  const finish = () => {
    dispatch({ type: "starter" });
    router.replace("/");
  };

  return (
    <div className="flex min-h-[var(--app-h)] flex-col bg-white px-5 pb-[calc(20px+var(--safe-bottom))] pt-[calc(16px+var(--safe-top))]">
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[13px] font-bold text-brand">Starter · 2 min</span>
        <div className="flex flex-1 gap-1" aria-hidden>
          {Array.from({ length: STEPS }, (_, k) => (
            <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= step ? "bg-brand" : "bg-[#E2E0EA]"}`} />
          ))}
        </div>
      </div>

      <div key={step} className="anim-enter flex flex-1 flex-col pt-6">
        {step === 0 && (
          <>
            <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">Hi {name}. Two quick things first.</h1>
            <p className="pt-3 text-[16px] leading-[1.5] text-muted">Before anything else, you&apos;ll do the two moments where beginners lose money most often, with practice money.</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Task n="1" title="Make your first trade" sub="And see what it really costs" />
              <Task n="2" title="Send money to a friend" sub="Without falling for a look-alike address" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Kicker>Task 1 · Your first trade</Kicker>
            <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">Buy ${amt} of Bitcoin.</h1>
            <p className="pt-2 text-[15px] leading-[1.5] text-muted">Before confirming, open the fees. Most people skip this. You won&apos;t.</p>
            <div className="mt-5 rounded-[20px] border border-line">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <CoinMark id="bitcoin" size={36} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold">Bitcoin</div>
                  <div className="tabular text-[13px] text-muted">{usd(price)} per BTC</div>
                </div>
                <div className="tabular text-[18px] font-extrabold">{usd(amt)}</div>
              </div>
              <button
                onClick={() => setFeesOpen(true)}
                aria-expanded={feesOpen}
                className={`flex min-h-[54px] w-full items-center justify-between border-t border-line px-4 text-left ${feesOpen ? "" : "bg-brand-tint"}`}
              >
                <span className="text-[14px] font-bold">
                  Fees and spread {!feesOpen && <span className="text-brand">· tap to see</span>}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="tabular text-[14px] font-bold">{usd(fee + spread)}</span>
                  <ChevronIcon className={feesOpen ? "rotate-90" : ""} color="#A3A0AE" />
                </span>
              </button>
              {feesOpen && (
                <div className="anim-enter flex flex-col gap-1.5 border-t border-line px-4 py-3.5 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-muted">Trading fee (1%)</span>
                    <span className="tabular font-bold">{usd(fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Spread (0.5%)</span>
                    <span className="tabular font-bold">{usd(spread)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted">You get about</span>
                    <span className="tabular font-bold">{qtyFmt(qty)} BTC</span>
                  </div>
                </div>
              )}
            </div>
            {feesOpen && <Note>That&apos;s {usd(fee + spread)} gone before the price even moves. Real apps charge different amounts, so checking is a habit worth keeping.</Note>}
          </>
        )}

        {step === 2 && (
          <Success
            title={`You own ${qtyFmt(qty)} BTC`}
            body="Real price, practice money. It will go up and down. That's normal, and it isn't a grade on you."
          />
        )}

        {step === 3 && (
          <>
            <Kicker>Task 2 · Pay a friend</Kicker>
            <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">Jordan wants $5 back for coffee. Which address is Jordan&apos;s?</h1>
            <div className="mt-4 rounded-[18px] bg-bg p-3">
              <div className="max-w-[90%] rounded-[16px] rounded-bl-[6px] bg-white px-3.5 py-2.5 text-[14px]">send the $5 in USDC on Base? here&apos;s my address</div>
              <div className="mt-1.5 max-w-[90%] break-all rounded-[16px] rounded-bl-[6px] bg-white px-3.5 py-2.5 font-mono text-[12px]">{chunk(REAL)}</div>
            </div>
            <div className="mt-3 text-[13px] font-bold text-muted">Your wallet suggests:</div>
            <div className="mt-2 flex flex-col gap-2">
              {order.map((a) => {
                const chosen = pick === a;
                const cls = chosen ? (a === REAL ? "!border-up bg-up-soft" : "!border-down bg-down-soft") : "";
                return (
                  <button key={a} disabled={pick === REAL} onClick={() => setPick(a)} className={`option px-4 py-3 text-left font-mono text-[12px] font-bold leading-[1.5] ${cls}`}>
                    {chunk(a)}
                  </button>
                );
              })}
            </div>
            {pick === FAKE && <Note bad>Look closer: it matches the start and the end, but not the middle. That&apos;s a planted look-alike. Try again.</Note>}
            {pick === REAL && <Note>That&apos;s it. Always compare the middle, not just the ends.</Note>}
          </>
        )}

        {step === 4 && (
          <>
            <Kicker>Task 2 · Pay a friend</Kicker>
            <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">Jordan asked for USDC on Base. Which network?</h1>
            <div className="mt-5 flex flex-col gap-2">
              {["Base", "Ethereum"].map((n) => {
                const chosen = net === n;
                const cls = chosen ? (n === "Base" ? "!border-up bg-up-soft" : "!border-down bg-down-soft") : "";
                return (
                  <button key={n} disabled={net === "Base"} onClick={() => setNet(n)} className={`option min-h-[56px] px-4 text-[16px] font-bold ${cls}`}>
                    {n}
                  </button>
                );
              })}
            </div>
            {net === "Ethereum" && <Note bad>Jordan is on Base. Sending on a different network can mean the money never shows up. Try again.</Note>}
            {net === "Base" && <Note>Right. Same coin, same network as the person you&apos;re paying.</Note>}
          </>
        )}

        {step === 5 && (
          <>
            <Kicker>Task 2 · Pay a friend</Kicker>
            <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">New contact? Send $1 first.</h1>
            <p className="pt-2 text-[15px] leading-[1.5] text-muted">A test send costs cents and catches mistakes before they cost you. You sent $1. Jordan replied:</p>
            <div className="mt-4 self-start rounded-[16px] rounded-bl-[6px] bg-bg px-3.5 py-2.5 text-[15px]">got the $1! 👍</div>
            <Note>Now the other $4 can go to the same address, safely.</Note>
          </>
        )}

        {step === 6 && <Success title="You're set" body="You just did the two moments that cost beginners the most. Next, your path: five skills, each learned, practiced, then proven." />}
      </div>

      <div className="pt-4">
        {step === 0 && <Btn onClick={() => setStep(1)}>Let&apos;s go</Btn>}
        {step === 1 && (
          <Btn
            disabled={!feesOpen}
            onClick={() => {
              if (quotes.bitcoin) dispatch({ type: "trade", coin: "bitcoin", side: "buy", usd: amt, price, feeChecked: true });
              setStep(2);
            }}
          >
            {feesOpen ? `Buy ${usd(amt)} of Bitcoin` : "Open the fees first"}
          </Btn>
        )}
        {step === 2 && <Btn onClick={() => setStep(3)}>Next: pay a friend</Btn>}
        {step === 3 && (
          <Btn disabled={pick !== REAL} onClick={() => setStep(4)}>
            Continue
          </Btn>
        )}
        {step === 4 && (
          <Btn disabled={net !== "Base"} onClick={() => setStep(5)}>
            Continue
          </Btn>
        )}
        {step === 5 && <Btn onClick={() => setStep(6)}>Send the other $4</Btn>}
        {step === 6 && <Btn onClick={finish}>Go to my home</Btn>}
      </div>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="pb-1 text-[13px] font-bold text-brand">{children}</div>;
}

function Task({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-bg px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-extrabold text-white">{n}</span>
      <div>
        <div className="text-[16px] font-bold">{title}</div>
        <div className="text-[13px] text-muted">{sub}</div>
      </div>
    </div>
  );
}

function Note({ children, bad }: { children: React.ReactNode; bad?: boolean }) {
  return (
    <div className="anim-enter mt-4 rounded-[18px] bg-bg p-4">
      <div className={`flex items-center gap-2 text-[13px] font-bold ${bad ? "text-down" : "text-brand"}`}>
        <SparkleIcon size={16} color={bad ? "#C4320A" : "#5521F5"} /> Buddy
      </div>
      <p className="pt-1 text-[14px] leading-[1.5] text-body">{children}</p>
    </div>
  );
}

function Success({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="anim-pop flex h-20 w-20 items-center justify-center rounded-full bg-up">
        <CheckIcon size={36} color="#fff" />
      </div>
      <h1 className="pt-6 text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em]">{title}</h1>
      <p className="max-w-[320px] pt-3 text-[16px] leading-[1.5] text-muted">{body}</p>
    </div>
  );
}

function Btn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn btn-brand">
      {children}
    </button>
  );
}
