"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COINS, usd, pct, qtyFmt } from "@/lib/coins";
import { dailyFor } from "@/lib/daily";
import { MISSIONS, MissionDef } from "@/lib/missions";
import { usePrices } from "@/lib/prices";
import { readiness, upNext } from "@/lib/progress";
import { DAILY_REWARD, HabitId, STARTING_CASH, habits, todayKey, useApp } from "@/lib/store";
import { ChatIcon, CheckIcon, InboxIcon, KeyIcon, MegaphoneIcon, SendIcon, SparkleIcon } from "./icons";
import { CoinMark, Sheet, Spark } from "./ui";

export function MissionIcon({ icon, size = 44 }: { icon: MissionDef["icon"]; size?: number }) {
  const I = { send: SendIcon, megaphone: MegaphoneIcon, chat: ChatIcon, key: KeyIcon, inbox: InboxIcon }[icon];
  return (
    <div className="flex shrink-0 items-center justify-center rounded-[14px] bg-bg" style={{ width: size, height: size }}>
      <I size={Math.round(size / 2)} color="#5521F5" />
    </div>
  );
}

export function CoinRow({ id, sub, value, change, last }: { id: string; sub: string; value: string; change: number; last?: boolean }) {
  const { quotes } = usePrices();
  const c = COINS.find((x) => x.id === id)!;
  const spark = quotes[id]?.spark ?? [];
  const stable = c.kind === "Stablecoin";
  const tone = stable || Math.abs(change) < 0.05 ? "text-muted" : change >= 0 ? "text-up" : "text-down";
  return (
    <Link
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

export function Wordmark({ size = 22, light = true }: { size?: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex items-center justify-center rounded-[30%]"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          background: light ? "rgba(255,255,255,0.16)" : BRAND_GRADIENT,
          boxShadow: light ? "inset 0 0 0 1px rgba(255,255,255,0.28)" : undefined,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        </svg>
      </span>
      <span className={`font-extrabold tracking-[-0.03em] ${light ? "text-white" : "text-ink"}`} style={{ fontSize: size }}>
        CryptoSim
      </span>
    </span>
  );
}

// Brief launch screen, once per visit.
export function Splash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("gone");
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("cs-splash") === "1";
      sessionStorage.setItem("cs-splash", "1");
    } catch {}
    if (seen) return;
    setPhase("show");
    const t1 = setTimeout(() => setPhase("fade"), 1100);
    const t2 = setTimeout(() => setPhase("gone"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "gone") return null;
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[90] mx-auto flex max-w-[430px] flex-col items-center justify-center transition-opacity duration-400 ${phase === "fade" ? "opacity-0" : "opacity-100"}`}
      style={{ background: BRAND_GRADIENT }}
    >
      <div className="anim-pop">
        <Wordmark size={30} />
      </div>
      <p className="absolute bottom-[calc(40px+var(--safe-bottom))] text-[13px] font-semibold text-white/70">Real prices · practice money</p>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone?: () => void } = {}) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.name);
  const slides = [
    null,
    {
      kicker: "Missions",
      title: "Make your first mistakes here.",
      body: "Missions recreate the scams and slip-ups that cost real people real money. Mess up, and Buddy explains what happened.",
    },
    {
      kicker: "Habits, not hype",
      title: "Build the habits that keep you safe.",
      body: "We track five safe habits, not trading wins. When you've practiced enough, you'll try one small, real send on a free test network.",
    },
  ];

  if (step === 0) {
    return (
      <div
        className="fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col overflow-hidden px-6 pb-[calc(24px+var(--safe-bottom))] pt-[calc(20px+var(--safe-top))] text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        <Wordmark size={20} />
        <div className="relative flex flex-1 items-center justify-center">
          <WelcomeArt />
        </div>
        <h1 className="anim-enter text-[36px] font-extrabold leading-[1.04] tracking-[-0.035em]">Practice crypto with real prices and fake money.</h1>
        <p className="anim-enter pt-3 text-[16px] leading-[1.5] text-white/75">
          Start with ${STARTING_CASH.toLocaleString()} in practice money. Make your first mistakes here, not with your savings.
        </p>
        <button onClick={() => setStep(1)} className="btn mt-7 bg-white text-brand">
          Get started
        </button>
        <p className="pt-3 text-center text-[12px] font-semibold text-white/60">No sign-up. Nothing to deposit.</p>
      </div>
    );
  }

  const s = slides[Math.min(step, 2)]!;
  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col bg-white px-6 pb-[calc(24px+var(--safe-bottom))] pt-[calc(24px+var(--safe-top))]">
      <div className="flex gap-1.5 pt-2" aria-hidden>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-track"}`} />
        ))}
      </div>
      {step < 3 ? (
        <div key={step} className="anim-enter flex flex-1 flex-col justify-center gap-4">
          <OnboardArt step={step} />
          <div className="text-[13px] font-bold text-brand">{s.kicker}</div>
          <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">{s.title}</h1>
          <p className="text-[16px] leading-[1.5] text-muted">{s.body}</p>
        </div>
      ) : (
        <form
          className="anim-enter flex flex-1 flex-col justify-center gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "onboard", name });
            onDone?.();
          }}
        >
          <div className="text-[13px] font-bold text-brand">Almost there</div>
          <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">What should we call you?</h1>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-muted">First name (optional, stays on this device)</span>
            <input
              id="onboard-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your name"
              className="h-14 rounded-[16px] border-[1.5px] border-track bg-white px-4 text-[17px] font-semibold outline-none focus:border-brand"
            />
          </label>
          <button type="submit" className="btn btn-brand mt-2">
            {state.onboarded ? "Done" : `Start with $${STARTING_CASH.toLocaleString()} practice money`}
          </button>
        </form>
      )}
      {step < 3 && (
        <div className="flex gap-3">
          <button onClick={() => setStep(step - 1)} className="btn btn-ghost !w-auto px-6">
            Back
          </button>
          <button onClick={() => setStep(step + 1)} className="btn btn-brand flex-1">
            Continue
          </button>
        </div>
      )}
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

function OnboardArt({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="mb-4 rounded-[24px] bg-bg p-5">
        <div className="text-[13px] font-semibold text-muted">Portfolio</div>
        <div className="text-[38px] font-extrabold tracking-[-0.035em]">$1,000.00</div>
        <div className="flex gap-2 pt-3">
          {COINS.map((c) => (
            <CoinMark key={c.id} id={c.id} size={34} />
          ))}
        </div>
      </div>
    );
  if (step === 1)
    return (
      <div className="mb-4 flex flex-col gap-2 rounded-[24px] bg-bg p-5">
        <div className="max-w-[85%] self-start rounded-[18px] rounded-bl-[6px] bg-white px-4 py-2.5 text-[14px]">
          Hi, this is Wallet Support. Please verify your recovery phrase.
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-down-soft px-3 py-1.5 text-[12px] font-bold text-down">
          Red flag: support never asks for this
        </div>
      </div>
    );
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-[24px] bg-bg p-5">
      {["Check fees before buying", "Ignore hype posts", "Never share your recovery phrase"].map((h, i) => (
        <div key={h} className="flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 text-[14px] font-bold">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i < 2 ? "bg-up" : "bg-track"}`}>
            {i < 2 && <CheckIcon size={14} color="#fff" />}
          </span>
          {h}
        </div>
      ))}
    </div>
  );
}

// Home's one next-step card: habit progress plus the single action that builds the next habit.
export function HabitCard() {
  const { state } = useApp();
  const h = habits(state);
  const r = readiness(state);
  const next = upNext(state);
  // Prefer the habit a mission teaches, so new users start with a mission, then market habits.
  const order: HabitId[] = ["addresses", "phrase", "hype", "fees", "calm"];
  const nextHabit = order.map((id) => h.list.find((x) => x.id === id)!).find((x) => x.status !== "locked-in");
  const mission = nextHabit ? MISSIONS.find((m) => nextHabit.href === `/missions/${m.id}`) : undefined;

  let title: string;
  let sub: string;
  let href: string;
  let kicker = `Safe habits · ${h.lockedIn} of ${h.total} locked in`;
  if (nextHabit) {
    title = nextHabit.name;
    sub = mission ? `Lock it in: ${mission.title} · ${mission.minutes} min` : nextHabit.how;
    href = nextHabit.href;
  } else if (next) {
    title = next.mission.title;
    sub = `Practice ${next.mission.skills.length > 1 ? "skills" : "a skill"} you haven't yet · ${next.mission.minutes} min`;
    href = `/missions/${next.mission.id}`;
  } else {
    kicker = `All ${h.total} safe habits locked in`;
    title = state.readiness?.passed ? "Try a real test send" : "Readiness check";
    sub = r.unlocked ? "See if you're ready for one small, real test" : "Practice the last few skills first";
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
          {mission || next || !nextHabit ? "Start" : "Go"}
        </Link>
      </div>
    </div>
  );
}

export { usd };
