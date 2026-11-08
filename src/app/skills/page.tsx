"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, ChevronIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { TabScreen } from "@/components/shell";
import { Sheet } from "@/components/ui";
import { readiness } from "@/lib/progress";
import { Level, SKILLS, levelOf } from "@/lib/skills";
import { Habit, habits, useApp } from "@/lib/store";

const LEVELS: Level[] = ["New", "Practicing", "Practiced"];

export default function Skills() {
  const { state } = useApp();
  const h = habits(state);
  const r = readiness(state);
  const [open, setOpen] = useState<Habit | null>(null);
  const practicing = h.list.filter((x) => x.status === "practicing").length;

  return (
    <TabScreen
      title="Skills"
      tone="white"
      hero={
        <div className="flex items-center gap-5 px-5 pb-2 pt-5">
          <Ring value={h.lockedIn} total={h.total} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-brand">Safe habits</div>
            <div className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              {h.lockedIn === 0 ? "None locked in yet" : `${h.lockedIn} locked in`}
            </div>
            <p className="pt-1 text-[13px] leading-[1.45] text-muted">
              {practicing ? `${practicing} more in progress. ` : ""}Habits are things you&apos;ve actually done, again and again.
            </p>
          </div>
        </div>
      }
    >
      <section aria-labelledby="habits" className="pt-4">
        <h2 id="habits" className="px-5 text-[20px] font-extrabold tracking-[-0.02em]">
          Habits
        </h2>
        <div className="pt-1">
          {h.list.map((x) => (
            <button key={x.id} onClick={() => setOpen(x)} className="flex min-h-[68px] w-full items-center gap-3.5 px-5 py-3 text-left active:bg-bg">
              <HabitDot status={x.status} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-bold leading-tight">{x.name}</div>
                <div className="pt-0.5 text-[13px] text-muted">{x.progress}</div>
              </div>
              <span className={`text-[13px] font-bold ${x.status === "locked-in" ? "text-up" : x.status === "practicing" ? "text-brand" : "text-faint"}`}>
                {x.status === "locked-in" ? "Locked in" : x.status === "practicing" ? "Practicing" : "Not yet"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="mx-5 my-3 h-2 rounded-full bg-bg" aria-hidden />

      <section aria-labelledby="skillmap">
        <div className="px-5">
          <h2 id="skillmap" className="text-[20px] font-extrabold tracking-[-0.02em]">
            Skill map
          </h2>
          <p className="pt-0.5 text-[13px] text-muted">How much you&apos;ve practiced each part of using crypto.</p>
        </div>
        <div className="pt-2">
          {SKILLS.map((s) => {
            const lvl = levelOf(state.skills[s.id]);
            const idx = LEVELS.indexOf(lvl);
            return (
              <Link key={s.id} href={s.href} className="flex flex-col gap-2 px-5 py-3.5 active:bg-bg">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[16px] font-bold">{s.name}</span>
                  <span className={`text-[13px] font-bold ${idx === 2 ? "text-up" : idx === 1 ? "text-brand" : "text-faint"}`}>{lvl}</span>
                </div>
                <div className="grid grid-cols-3 gap-1" role="img" aria-label={`${s.name}: ${lvl}`}>
                  {LEVELS.map((l, i) => (
                    <span key={l} className={`h-1.5 rounded-full ${i <= idx && state.skills[s.id] > 0 ? (idx === 2 ? "bg-up" : "bg-brand") : "bg-[#E8E6EF]"}`} />
                  ))}
                </div>
                <span className="text-[13px] text-muted">{s.about}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="px-5 pt-3">
        <Link href="/ready" className="flex items-center gap-3.5 rounded-[20px] bg-bg p-4">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-white">
            {r.unlocked ? <ShieldIcon color="#5521F5" /> : <LockIcon size={22} color="#5521F5" />}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-bold">Ready for a real test?</div>
            <div className="text-[13px] text-muted">
              {state.graduation?.tx
                ? "Graduated · real test send done"
                : state.readiness?.passed
                  ? "Check passed · try a test send"
                  : r.unlocked
                    ? "Take the readiness check"
                    : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} steps done to unlock`}
            </div>
          </div>
          <ChevronIcon color="#A3A0AE" />
        </Link>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name}>
        {open && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-[1.5] text-body">{open.detail}</p>
            <div className="rounded-[18px] bg-bg p-4">
              <div className="text-[12px] font-bold text-muted">Your progress</div>
              <div className="pt-0.5 text-[16px] font-extrabold">{open.progress}</div>
              <div className="pt-2 text-[12px] font-bold text-muted">To lock it in</div>
              <div className="pt-0.5 text-[14px] text-body">{open.how}</div>
            </div>
            <Link href={open.href} onClick={() => setOpen(null)} className="btn btn-brand">
              {open.href.startsWith("/missions") ? "Practice in a mission" : "Practice in the market"}
            </Link>
          </div>
        )}
      </Sheet>
    </TabScreen>
  );
}

function Ring({ value, total }: { value: number; total: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const gap = 6;
  const seg = c / total;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0" role="img" aria-label={`${value} of ${total} safe habits locked in`}>
      <g transform="rotate(-90 56 56)">
        {Array.from({ length: total }, (_, i) => (
          <circle
            key={i}
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke={i < value ? "#5521F5" : "#ECEAF2"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${seg - gap} ${c - seg + gap}`}
            strokeDashoffset={-i * seg - gap / 2}
          />
        ))}
      </g>
      <text x="56" y="55" textAnchor="middle" fontSize="30" fontWeight="800" fill="#12111A" letterSpacing="-1">
        {value}
      </text>
      <text x="56" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6B6878">
        of {total}
      </text>
    </svg>
  );
}

function HabitDot({ status }: { status: Habit["status"] }) {
  if (status === "locked-in")
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand">
        <CheckIcon size={17} color="#fff" />
      </span>
    );
  if (status === "practicing")
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft">
        <span className="h-3 w-3 rounded-full bg-brand" />
      </span>
    );
  return <span className="h-9 w-9 shrink-0 rounded-full border-[1.5px] border-dashed border-[#C9C6D4]" />;
}
