"use client";

import Link from "next/link";
import { useState } from "react";
import { TabScreen } from "@/components/shell";
import { Sheet } from "@/components/ui";
import { Habit, habits, useApp } from "@/lib/store";

// Habits tab: the five core habits, each with the last five times you faced it, and what happened recently.
export default function Habits() {
  const { state } = useApp();
  const h = habits(state);
  const [open, setOpen] = useState<Habit | null>(null);
  const recent = (state.log ?? []).slice(0, 6);
  const names = Object.fromEntries(h.list.map((x) => [x.id, x.name]));

  return (
    <TabScreen
      title="Habits"
      tone="white"
      hero={
        <div className="px-5 pb-1 pt-4">
          <div className="tabular text-[40px] font-extrabold leading-none tracking-[-0.04em]">
            {h.lockedIn} of {h.total}
          </div>
          <div className="pt-1.5 text-[16px] font-semibold text-muted">locked in</div>
          <p className="pt-3 text-[15px] leading-[1.45] text-body">A habit locks in when you do the safe thing most times, not once.</p>
        </div>
      }
    >
      <section aria-labelledby="core" className="px-5 pt-6">
        <h2 id="core" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
          Core habits
        </h2>
        <div className="border-t border-line">
          {h.list.map((x) => (
            <button key={x.id} onClick={() => setOpen(x)} className="flex w-full items-center gap-4 border-b border-line py-3.5 text-left active:bg-bg">
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-tight">{x.name}</span>
                <Dots recent={x.recent} />
              </span>
              <Status habit={x} />
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent" className="px-5 pt-7">
          <h2 id="recent" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
            Recent
          </h2>
          <div className="border-t border-line">
            {recent.map((e, i) => (
              <div key={`${e.at}-${i}`} className="flex items-center gap-3 border-b border-line py-3">
                <Mark ok={e.ok} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{names[e.habit]}</span>
                  <span className="block text-[13px] text-muted">
                    {e.label} · {ago(e.at)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name}>
        {open && (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] leading-[1.5] text-body">{open.detail}</p>
            <div className="border-t border-line">
              <div className="flex justify-between gap-4 border-b border-line py-3 text-[15px]">
                <span className="text-muted">So far</span>
                <span className="text-right font-bold">{open.progress}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-line py-3 text-[15px]">
                <span className="shrink-0 text-muted">To lock it in</span>
                <span className="text-right font-semibold">{open.how}</span>
              </div>
            </div>
            <Link href={open.href} onClick={() => setOpen(null)} className="btn btn-brand">
              {open.action}
            </Link>
          </div>
        )}
      </Sheet>
    </TabScreen>
  );
}

function Status({ habit }: { habit: Habit }) {
  if (habit.status === "locked-in") return <span className="shrink-0 text-[14px] font-extrabold text-good-ink">✓ Locked in</span>;
  if (habit.status === "practicing") return <span className="shrink-0 text-right text-[14px] font-semibold text-muted">{habit.progress}</span>;
  return <span className="shrink-0 text-[14px] font-bold text-brand">{habit.action} ›</span>;
}

// The last five times this habit came up: a check for the safe choice, a cross for a slip, empty for not yet.
function Dots({ recent }: { recent: boolean[] }) {
  // Oldest on the left, newest on the right; empty slots after.
  const ordered = [...recent].reverse();
  const slots = Array.from({ length: 5 }, (_, i) => ordered[i] as boolean | undefined);
  return (
    <span className="mt-2 flex gap-1.5" role="img" aria-label={recent.length ? `Last ${recent.length}: ${recent.filter(Boolean).length} safe` : "Not tried yet"}>
      {slots.map((v, i) => (
        <span
          key={i}
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-black ${
            v === undefined ? "border-[1.5px] border-track" : v ? "bg-good text-white" : "bg-bad text-white"
          }`}
        >
          {v === undefined ? "" : v ? "✓" : "✕"}
        </span>
      ))}
    </span>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white ${ok ? "bg-good" : "bg-bad"}`}>
      {ok ? "✓" : "✕"}
    </span>
  );
}

function ago(at: number) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
