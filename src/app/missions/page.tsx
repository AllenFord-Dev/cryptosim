"use client";

import Link from "next/link";
import { NextStepCard } from "@/components/bits";
import { TabScreen } from "@/components/shell";
import { readiness, skillStatus, upNext } from "@/lib/progress";
import { SKILLS } from "@/lib/skills";
import { useApp } from "@/lib/store";

// Missions tab: one next step, then the core path of five skills (Learn, Practice, Prove each).
export default function Missions() {
  const { state } = useApp();
  const next = upNext(state);
  const r = readiness(state);
  const statuses = SKILLS.map((s) => ({ skill: s, ...skillStatus(state, s) }));
  const proven = statuses.filter((s) => s.proven).length;
  const readyLabel = state.readiness?.passed
    ? "Passed"
    : r.unlocked
      ? "Take it ›"
      : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} to unlock`;

  return (
    <TabScreen
      title="Missions"
      tone="white"
      hero={
        <div className="px-5 pb-1 pt-4">
          <div className="tabular text-[40px] font-extrabold leading-none tracking-[-0.04em]">
            {proven} of {SKILLS.length}
          </div>
          <div className="pt-1.5 text-[16px] font-semibold text-muted">skills proven</div>
        </div>
      }
    >
      <div className="px-5 pt-5">
        <NextStepCard />
      </div>

      <section aria-labelledby="path" className="px-5 pt-7">
        <h2 id="path" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
          Core path
        </h2>
        <div className="border-t border-line">
          {statuses.map((s, idx) => {
            const isNext = next?.skill.id === s.skill.id;
            const status = s.proven ? "Proven" : s.step === "learn" ? "Learn" : s.step === "practice" ? "Practice" : "Prove";
            return (
              <Link key={s.skill.id} href={`/skills/${s.skill.id}`} className="flex items-center gap-3.5 border-b border-line py-3.5 active:bg-bg">
                <span
                  className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ${
                    s.proven ? "bg-ink text-card" : isNext ? "border-[1.5px] border-brand text-brand" : "border-[1.5px] border-track text-muted"
                  }`}
                >
                  {s.proven ? "✓" : idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold leading-tight">{s.skill.name}</span>
                  <span className="mt-2 flex w-[84px] gap-[3px]" role="img" aria-label={`${s.skill.name}: ${s.done} of 3 steps done`}>
                    {[0, 1, 2].map((k) => (
                      <span key={k} className={`h-1 flex-1 rounded-full ${k < s.done ? (s.proven ? "bg-ink" : "bg-brand") : "bg-track"}`} />
                    ))}
                  </span>
                </span>
                <span className={`shrink-0 text-[14px] font-bold ${s.proven ? "text-ink" : isNext ? "text-brand" : "text-muted"}`}>
                  {status}
                  {isNext ? " ›" : ""}
                </span>
              </Link>
            );
          })}
          <Link href="/ready" className="flex items-center gap-3.5 border-b border-line py-3.5 active:bg-bg">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-track text-[13px] text-muted">
              ★
            </span>
            <span className="flex-1 text-[16px] font-bold">Readiness check</span>
            <span className={`shrink-0 text-[14px] font-bold ${r.unlocked && !state.readiness?.passed ? "text-brand" : "text-muted"}`}>{readyLabel}</span>
          </Link>
        </div>
      </section>
    </TabScreen>
  );
}
