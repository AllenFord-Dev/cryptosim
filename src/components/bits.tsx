"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { COINS, usd, pct, qtyFmt } from "@/lib/coins";
import { dailyFor } from "@/lib/daily";
import { MissionDef } from "@/lib/missions";
import { usePrices } from "@/lib/prices";
import { readiness, upNext } from "@/lib/progress";
import { DAILY_REWARD, STARTING_CASH, habits, todayKey, useApp } from "@/lib/store";
import { ChatIcon, CheckIcon, InboxIcon, KeyIcon, MarketIcon, MegaphoneIcon, SendIcon, SparkleIcon } from "./icons";
import { CoinMark, Sheet, Spark } from "./ui";
import { Wordmark } from "./logo";
export { Wordmark };

export function MissionIcon({ icon, size = 44 }: { icon: MissionDef["icon"]; size?: number }) {
  const I = { send: SendIcon, megaphone: MegaphoneIcon, chat: ChatIcon, key: KeyIcon, inbox: InboxIcon, chart: MarketIcon }[icon];
  return (
    <div className="flex shrink-0 items-center justify-center rounded-[14px] bg-bg" style={{ width: size, height: size }}>
      <I size={Math.round(size / 2)} color="#5521F5" />
    </div>
  );
}

export function CoinRow({ id, sub, value, change, last }: { id: string; sub: string; value: string; change: number; last?: boolean }) {
  const coach = `coin-${id}`;
  const { quotes } = usePrices();
  const c = COINS.find((x) => x.id === id)!;
  const spark = quotes[id]?.spark ?? [];
  const stable = c.kind === "Stablecoin";
  const tone = stable || Math.abs(change) < 0.05 ? "text-muted" : change >= 0 ? "text-up" : "text-down";
  return (
    <Link
      data-coach={coach}
      href={`/coin/${id}`}
      className={`flex items-center gap-3 py-2.5 ${last ? "" : "border-b border-line"}`}
    >
      <CoinMark id={id} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold">{c.name}</div>
        <div className="truncate text-[12px] text-muted">{sub}</div>
      </div>
      {spark.length > 1 && <Spark values={spark.slice(-14)} />}
      <div className="w-[78px] text-right">
        <div className="tabular text-[14px] font-extrabold">{value}</div>
        <div className={`tabular text-[12px] font-bold ${tone}`}>{stable ? "0.0%" : pct(change)}</div>
      </div>
    </Link>
  );
}

export function holdingSub(id: string, qty: number) {
  const c = COINS.find((x) => x.id === id)!;
  return `${c.kind === "Stablecoin" ? "Stablecoin · " : ""}${qtyFmt(qty)} ${c.symbol}`;
}

export function PriceSource() {
  const { source, updatedAt } = usePrices();
  if (source === "loading") return <p className="px-1 text-[12px] text-faint">Loading prices…</p>;
  const time = new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <p className="px-1 text-[12px] leading-[1.45] text-muted">
      {source === "live"
        ? `Live prices from CoinGecko · updated ${time}`
        : "Live prices are unavailable right now, so these are sample prices."}{" "}
      All money in CryptoSim is practice money.
    </p>
  );
}

export function DailySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const date = todayKey();
  const q = dailyFor(date);
  const [picked, setPicked] = useState<number | null>(null);
  const doneToday = state.daily.last === date;
  const show = picked !== null || doneToday;
  return (
    <Sheet open={open} onClose={onClose} title="Daily scam check">
      <p className="text-[13px] font-bold text-brand">One question a day · earn ${DAILY_REWARD} practice money</p>
      <p className="pt-2 text-[18px] font-extrabold leading-[1.3] tracking-[-0.01em]">{q.q}</p>
      <div className="flex flex-col gap-2.5 pt-4">
        {q.options.map((o, i) => {
          const chosen = picked === i;
          const cls = show
            ? o.correct
              ? "border-up bg-up-soft"
              : chosen
                ? "border-down bg-down-soft"
                : "opacity-60"
            : "";
          return (
            <button
              key={o.label}
              disabled={show}
              onClick={() => {
                setPicked(i);
                dispatch({ type: "daily", date, correct: o.correct });
              }}
              className={`option flex min-h-[56px] items-center justify-between px-4 py-3 text-[15px] font-bold ${cls}`}
            >
              {o.label}
              {show && o.correct && <CheckIcon color="#0F7B4F" />}
            </button>
          );
        })}
      </div>
      {show && (
        <div className="anim-enter mt-4 rounded-[18px] bg-bg p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-brand">
            <SparkleIcon size={16} color="#5521F5" /> Buddy
          </div>
          <p className="pt-1 text-[14px] leading-[1.5] text-body">{q.why}</p>
          {picked !== null && (
            <p className="pt-2 text-[13px] font-bold text-muted">
              {q.options[picked].correct ? `+$${DAILY_REWARD} practice money added.` : "No reward this time. Come back tomorrow for a new one."}
            </p>
          )}
          {picked === null && doneToday && <p className="pt-2 text-[13px] font-bold text-muted">You&apos;ve done today&apos;s check. New one tomorrow.</p>}
        </div>
      )}
      <button onClick={onClose} className="btn btn-dark mt-4">
        Done
      </button>
    </Sheet>
  );
}

export const BRAND_GRADIENT =
  "radial-gradient(120% 70% at 85% 0%, rgba(160,130,255,0.55) 0%, rgba(160,130,255,0) 60%), linear-gradient(165deg, #6A3BFF 0%, #5521F5 38%, #3412B8 72%, #1D0868 100%)";

// Brief launch screen, once per visit.
export function Splash() {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("gone");
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("cs-splash") === "1";
      sessionStorage.setItem("cs-splash", "1");
    } catch {}
    if (seen) return;
    setPhase("show");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const t1 = setTimeout(() => {
      setPhase(reduced ? "gone" : "leave");
      root.dataset.handoff = "1";
    }, reduced ? 1200 : 2100);
    const t2 = setTimeout(() => {
      setPhase("gone");
      delete root.dataset.handoff;
    }, 2650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      delete root.dataset.handoff;
    };
  }, []);
  // The coins land centered on their own, then the lockup glides left as the name slides out from behind them.
  useLayoutEffect(() => {
    const lock = wrap.current?.querySelector(".logo-lock") as HTMLElement | null;
    const word = wrap.current?.querySelector(".logo-word-clip") as HTMLElement | null;
    if (lock && word) lock.style.setProperty("--half", `${(word.offsetWidth + parseFloat(getComputedStyle(word).marginLeft)) / 2}px`);
  }, [phase === "gone"]);
  if (phase === "gone") return null;
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[90] mx-auto flex max-w-[430px] flex-col items-center justify-center ${phase === "leave" ? "splash-leave" : ""}`}
      style={{ background: BRAND_GRADIENT }}
    >
      <div ref={wrap} className="logo-lock-wrap">
        <Wordmark size={34} tone="light" animate />
      </div>
      <p className="absolute bottom-[calc(40px+var(--safe-bottom))] text-[13px] font-semibold text-white/70">Real prices · practice money</p>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone?: () => void } = {}) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.name);
  if (step === 0) {
    return (
      <div
        className="handoff-in fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col overflow-hidden px-6 pb-[calc(24px+var(--safe-bottom))] pt-[calc(20px+var(--safe-top))] text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        <Wordmark size={22} tone="light" />
        <div className="relative flex flex-1 items-center justify-center">
          <WelcomeArt />
        </div>
        <h1 className="anim-enter text-[36px] font-extrabold leading-[1.04] tracking-[-0.035em]">Practice crypto with real prices and fake money.</h1>
        <button onClick={() => setStep(1)} className="btn mt-7 bg-white text-brand">
          Get started
        </button>
        <p className="pt-3 text-center text-[12px] font-semibold text-white/60">No sign-up. Nothing to deposit.</p>
      </div>
    );
  }

  const save = (n: string) => {
    dispatch({ type: "onboard", name: n });
    onDone?.();
  };
  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col bg-white pb-[calc(16px+var(--safe-bottom))] pt-[calc(8px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-between px-2">
        <button onClick={() => setStep(0)} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12111A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button onClick={() => save("")} className="h-11 px-4 text-[15px] font-semibold text-muted">
          Skip
        </button>
      </div>
      <form
        className="flex flex-1 flex-col px-6"
        onSubmit={(e) => {
          e.preventDefault();
          save(name);
        }}
      >
        <div className="anim-enter pt-4">
          <h1 className="text-[30px] font-bold leading-[1.12] tracking-[-0.03em]">What should we call you?</h1>
          <p className="pt-2 text-[16px] text-muted">Just a first name. It stays on this phone.</p>
          <label htmlFor="onboard-name" className="sr-only">
            First name
          </label>
          <input
            id="onboard-name"
            autoFocus
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="First name"
            style={{ outline: "none" }}
            className="mt-8 w-full border-b-2 border-track bg-transparent pb-2 text-[30px] font-bold tracking-[-0.02em] outline-none transition-colors placeholder:text-[#D4D1DE] focus:border-brand"
          />
        </div>
        <div className="mt-auto">
          <button type="submit" disabled={!name.trim()} className="btn btn-brand">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

function WelcomeArt() {
  return (
    <div className="relative h-[280px] w-full max-w-[330px]" aria-hidden>
      <div className="anim-enter absolute left-1/2 top-[18px] w-[250px] -translate-x-1/2 rounded-[24px] bg-white/[0.14] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] backdrop-blur-md">
        <div className="text-[12px] font-semibold text-white/70">Portfolio</div>
        <div className="tabular text-[34px] font-extrabold tracking-[-0.035em]">$1,000.00</div>
        <svg viewBox="0 0 210 54" className="mt-2 w-full" aria-hidden>
          <path d="M0 44 L14 40 L26 42 L38 33 L50 36 L62 27 L74 30 L86 22 L98 26 L110 18 L122 21 L134 14 L146 19 L158 11 L170 15 L182 8 L196 10 L210 4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="anim-enter absolute left-0 top-[170px] flex items-center gap-2.5 rounded-[18px] bg-white px-3.5 py-2.5 text-ink shadow-[0_16px_40px_-12px_rgba(20,6,80,0.5)] [animation-delay:120ms]">
        <CoinMark id="bitcoin" size={30} />
        <div>
          <div className="text-[13px] font-extrabold">Bitcoin</div>
          <div className="text-[11px] font-semibold text-up">Bought $50</div>
        </div>
      </div>
      <div className="anim-enter absolute right-0 top-[196px] flex items-center gap-2 rounded-[18px] bg-white px-3.5 py-2.5 text-ink shadow-[0_16px_40px_-12px_rgba(20,6,80,0.5)] [animation-delay:220ms]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-up">
          <CheckIcon size={13} color="#fff" />
        </span>
        <div className="text-[13px] font-extrabold">Scam spotted</div>
      </div>
    </div>
  );
}


// Home's one next-step card: habit progress plus the single action that builds the next habit.
export function HabitCard() {
  const { state } = useApp();
  const h = habits(state);
  const r = readiness(state);
  const next = upNext(state);

  let kicker = `Safe habits · ${h.lockedIn} of ${h.total} locked in`;
  let title: string;
  let sub: string;
  let href: string;
  let cta = "Start";
  if (next) {
    title = next.target.title;
    sub = `${next.target.label} · ${next.skill.name} · ${next.target.minutes} min`;
    href = next.target.href;
    cta = next.step === "learn" ? "Learn" : next.step === "prove" ? "Prove" : "Start";
  } else {
    kicker = "Every skill proven";
    title = state.readiness?.passed ? "Try a real test send" : "Readiness check";
    sub = r.unlocked ? "See if you're ready for one small, real test" : "Lock in a few more habits first";
    href = "/ready";
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-white p-4">
      <Link href="/skills" className="flex items-baseline justify-between">
        <span className="text-[12px] font-bold text-brand">{kicker}</span>
        <span className="text-[13px] font-bold text-muted">See all</span>
      </Link>
      <div className="flex gap-1.5" role="img" aria-label={`${h.lockedIn} of ${h.total} safe habits locked in`}>
        {h.list.map((x, i) => (
          <span key={x.id} className={`h-2 flex-1 rounded-full ${i < h.lockedIn ? "bg-brand" : "bg-[#E2E0EA]"}`} />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-0.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[16px] font-extrabold leading-tight">{title}</span>
          <span className="text-[13px] text-muted">{sub}</span>
        </div>
        <Link href={href} className="flex h-10 shrink-0 items-center rounded-full bg-brand px-4 text-[14px] font-bold text-white">
          {cta}
        </Link>
      </div>
    </div>
  );
}

export { usd };
