"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COINS, usd, pct, qtyFmt } from "@/lib/coins";
import { dailyFor } from "@/lib/daily";
import { MissionDef } from "@/lib/missions";
import { usePrices } from "@/lib/prices";
import { readiness, upNext } from "@/lib/progress";
import { DAILY_REWARD, STARTING_CASH, habits, todayKey, useApp } from "@/lib/store";
import { ChatIcon, CheckIcon, InboxIcon, KeyIcon, MarketIcon, MegaphoneIcon, SendIcon, SparkleIcon } from "./icons";
import { CoinMark, Sheet, Spark } from "./ui";
import { LogoMark, Wordmark } from "./logo";
export { Wordmark };

export function MissionIcon({ icon, size = 44 }: { icon: MissionDef["icon"]; size?: number }) {
  const I = {
    send: SendIcon,
    megaphone: MegaphoneIcon,
    chat: ChatIcon,
    key: KeyIcon,
    inbox: InboxIcon,
    chart: MarketIcon,
  }[icon];
  return (
    <div className="flex shrink-0 items-center justify-center rounded-[14px] bg-bg" style={{ width: size, height: size }}>
      <I size={Math.round(size / 2)} color="var(--color-brand)" />
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
    <Link data-coach={coach} href={`/coin/${id}`} className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-line"}`}>
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
  const time = new Date(updatedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <p className="px-1 text-[12px] leading-[1.45] text-muted">
      {source === "live" ? `Live prices from CoinGecko · updated ${time}` : "Live prices are unavailable right now, so these are sample prices."} All
      money in CryptoSim is practice money.
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
          const cls = show ? (o.correct ? "border-up bg-up-soft" : chosen ? "border-down bg-down-soft" : "opacity-60") : "";
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
              {show && o.correct && <CheckIcon color="var(--color-up)" />}
            </button>
          );
        })}
      </div>
      {show && (
        <div className="anim-enter mt-4 rounded-[18px] bg-bg p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-brand">
            <SparkleIcon size={16} color="var(--color-brand)" /> Buddy
          </div>
          <p className="pt-1 text-[14px] leading-[1.5] text-body">{q.why}</p>
          {picked !== null && (
            <p className="pt-2 text-[13px] font-bold text-muted">
              {q.options[picked].correct ? `+$${DAILY_REWARD} practice money added.` : "No reward this time. Come back tomorrow for a new one."}
            </p>
          )}
          {picked === null && doneToday && (
            <p className="pt-2 text-[13px] font-bold text-muted">You&apos;ve done today&apos;s check. New one tomorrow.</p>
          )}
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
// Launch cover, drawn on the server so nothing flashes while saved progress loads.
// First visit: plain purple that hands straight to the animated welcome.
// Returning users, once per session: the logo lands, then zooms through to Home (tap to skip).
// The script in layout sets data-launch / data-nosplash before first paint.
export function Splash() {
  const { state, ready } = useApp();
  const [launching] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.launch === "1");
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!launching) return;
    try {
      sessionStorage.setItem("cs-launch", "1");
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setGone(true), reduced ? 600 : 2200);
    return () => clearTimeout(t);
  }, [launching]);
  if (gone || (ready && (!state.onboarded || !launching))) return null;
  return (
    <div
      aria-hidden
      onClick={() => setGone(true)}
      onAnimationEnd={(e) => e.animationName === "launchOut" && setGone(true)}
      className="splash fixed inset-0 z-[90] mx-auto flex max-w-[430px] items-center justify-center"
      style={{ background: BRAND_GRADIENT }}
    >
      <div className="splash-brand -mt-10 flex-col items-center gap-4 text-white">
        <LogoMark size={104} tone="light" animate />
        <span className="splash-name text-[34px] leading-none tracking-[-0.04em]">
          <span className="font-medium">crypto</span>
          <span className="font-extrabold text-[#C9B8FF]">sim</span>
        </span>
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone?: () => void } = {}) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [name, setName] = useState(state.name);
  if (step === 0) {
    // The logo lands and holds where it ends up; then the headline and button slide up from the bottom edge.
    return (
      <div
        className="welcome-anim fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col overflow-hidden px-6 pb-[calc(24px+var(--safe-bottom))] pt-[calc(20px+var(--safe-top))] text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <LogoMark size={104} tone="light" animate />
          <span className="welcome-name text-[34px] leading-none tracking-[-0.04em]">
            <span className="font-medium">crypto</span>
            <span className="font-extrabold text-[#C9B8FF]">sim</span>
          </span>
        </div>
        <div className="welcome-bottom flex flex-col">
          <h1 className="pb-7 text-center text-[28px] font-extrabold leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">
            Learn crypto before it costs you.
          </h1>
          <button onClick={() => setStep(1)} className="btn bg-white text-brand">
            Get started
          </button>
          <p className="pt-3 text-center text-[12px] font-semibold text-white/60">Takes 2 minutes</p>
        </div>
      </div>
    );
  }

  // Slide the name screen off to the left, revealing Home, then start the guided first trade.
  const save = (n: string) => {
    if (leaving) return;
    setLeaving(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        dispatch({ type: "onboard", name: n });
        onDone?.();
      },
      reduced ? 0 : 380,
    );
  };
  return (
    <>
      {/* The welcome slides off to the left as the name screen pushes in. */}
      {!leaving && <div aria-hidden className="onb-leave fixed inset-0 z-[59] mx-auto max-w-[430px]" style={{ background: BRAND_GRADIENT }} />}
      <div
        className={`${leaving ? "onb-leave" : "onb-enter"} fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col bg-card pb-[calc(16px+var(--safe-bottom))] pt-[calc(8px+var(--safe-top))]`}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <button onClick={() => setStep(0)} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
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
              className="mt-8 w-full border-b-2 border-track bg-transparent pb-2 text-[30px] font-bold tracking-[-0.02em] outline-none transition-colors placeholder:text-faint focus:border-brand"
            />
          </div>
          <div className="mt-auto">
            <button type="submit" disabled={!name.trim()} className="btn btn-brand">
              Continue
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Home's one next-step card: habit progress plus the single action that builds the next habit.
// The one next step, shared by Home and Missions: the only card on either screen.
export function NextStepCard() {
  const { state } = useApp();
  const r = readiness(state);
  const next = upNext(state);
  let title: string;
  let sub: string;
  let href: string;
  let cta = "Start";
  if (state.tour === "send") {
    title = "Last step: pay a friend back";
    sub = "Send safely · about 2 minutes";
    href = "/missions/pay-back?starter=1";
  } else if (next) {
    title = next.target.label === "Practice" ? `Practice: ${next.target.title}` : next.target.title;
    sub = next.step === "learn" ? "1 minute · then practice it" : `${next.skill.name} · ${next.target.minutes} minutes`;
    href = next.target.href;
  } else {
    title = state.readiness?.passed ? "Try a real test send" : "Every core skill proven";
    sub = state.readiness?.passed ? "One small send on a test network" : r.unlocked ? "See if you're ready for one small, real test" : "Lock in a few more habits first";
    href = "/ready";
    cta = state.readiness?.passed ? "Start" : "Readiness check";
  }
  return (
    <div className="rounded-[22px] bg-brand-tint p-[18px]">
      <div className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.025em]">{title}</div>
      <div className="pt-1 text-[14.5px] text-body">{sub}</div>
      <Link href={href} className="btn btn-brand mt-4 !h-12">
        {cta}
      </Link>
    </div>
  );
}

export { usd };
