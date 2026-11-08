"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, ChevronIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { TabScreen } from "@/components/shell";
import { Bar, Sheet } from "@/components/ui";
import { readiness } from "@/lib/progress";
import { SKILLS, levelOf } from "@/lib/skills";
import { Habit, habits, useApp } from "@/lib/store";

export default function Skills() {
  const { state, dispatch } = useApp();
  const h = habits(state);
  const r = readiness(state);
  const [open, setOpen] = useState<Habit | null>(null);
  const [reset, setReset] = useState(false);

  return (
    <TabScreen
      title="Skills"
      hero={
        <div className="px-6 pb-5 pt-4">
          <div className="text-[14px] font-semibold text-muted">Safe habits</div>
          <div className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em]">
            {h.lockedIn} <span className="text-[20px] font-bold text-muted">of {h.total} locked in</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {h.list.map((x, i) => (
              <span key={x.id} className={`h-2 flex-1 rounded-full ${i < h.lockedIn ? "bg-brand" : "bg-[#E2E0EA]"}`} />
            ))}
          </div>
          <p className="pt-3 text-[13px] leading-[1.45] text-muted">
            Habits are things you&apos;ve actually done, again and again. They don&apos;t mean you&apos;re good at crypto. They mean you&apos;ve rehearsed the
            moments where people lose money.
          </p>
        </div>
      }
    >
      <div className="rounded-[20px] bg-white px-4 py-2">
        {h.list.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setOpen(x)}
            className={`flex min-h-[64px] w-full items-center gap-3 py-3 text-left ${i ? "border-t border-line" : ""}`}
          >
            <HabitDot status={x.status} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">{x.name}</div>
              <div className="text-[12px] text-muted">{x.progress}</div>
            </div>
            <span
              className={`shrink-0 text-[12px] font-bold ${x.status === "locked-in" ? "text-up" : x.status === "practicing" ? "text-brand" : "text-faint"}`}
            >
              {x.status === "locked-in" ? "Locked in" : x.status === "practicing" ? "Practicing" : "Not yet"}
            </span>
            <ChevronIcon color="#C9C6D4" />
          </button>
        ))}
      </div>

      <div className="rounded-[20px] bg-white p-4">
        <div className="text-[16px] font-extrabold">Skill map</div>
        <p className="pt-0.5 text-[13px] text-muted">How much you&apos;ve practiced each part of using crypto.</p>
        <div className="flex flex-col gap-4 pt-4">
          {SKILLS.map((s) => {
            const v = state.skills[s.id];
            const lvl = levelOf(v);
            return (
              <Link key={s.id} href={s.href} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-bold">{s.name}</span>
                  <span className={`text-[12px] font-bold ${lvl === "Practiced" ? "text-up" : lvl === "Practicing" ? "text-brand" : "text-faint"}`}>{lvl}</span>
                </div>
                <Bar value={v} tone={lvl === "Practiced" ? "good" : "brand"} />
                <span className="text-[12px] text-muted">{s.about}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <Link href="/ready" className="flex items-center gap-3 rounded-[20px] bg-white p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-bg">
          {r.unlocked ? <ShieldIcon color="#5521F5" /> : <LockIcon size={20} color="#8A8796" />}
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-extrabold">Ready for a real test?</div>
          <div className="text-[13px] text-muted">
            {state.graduation?.tx ? "Graduated · real test send done" : state.readiness?.passed ? "Check passed · try a test send" : r.unlocked ? "Take the readiness check" : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} requirements met`}
          </div>
        </div>
        <ChevronIcon color="#C9C6D4" />
      </Link>

      <button onClick={() => setReset(true)} className="py-3 text-[13px] font-bold text-muted">
        Reset all practice progress
      </button>

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

      <Sheet open={reset} onClose={() => setReset(false)} title="Reset progress?">
        <p className="text-[15px] leading-[1.5] text-body">
          This clears your practice money, coins, missions, skills and habits on this device. You&apos;ll start over with $1,000.
        </p>
        <div className="flex flex-col gap-2.5 pt-5">
          <button
            onClick={() => {
              dispatch({ type: "reset" });
              setReset(false);
            }}
            className="btn bg-down text-white"
          >
            Reset everything
          </button>
          <button onClick={() => setReset(false)} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </Sheet>
    </TabScreen>
  );
}

function HabitDot({ status }: { status: Habit["status"] }) {
  if (status === "locked-in")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand">
        <CheckIcon size={16} color="#fff" />
      </span>
    );
  if (status === "practicing")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand">
        <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      </span>
    );
  return <span className="h-8 w-8 shrink-0 rounded-full border-[1.5px] border-dashed border-[#C9C6D4]" />;
}
