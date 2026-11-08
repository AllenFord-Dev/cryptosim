"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { planLabel } from "@/components/plan-setup";
import { marketProgress } from "@/lib/market-practice";
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
  const [tab, setTab] = useState<"safety" | "market">("safety");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "market") setTab("market");
  }, []);
  const mp = marketProgress(state);
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
        <div className="px-5 pb-1 pt-3">
          <div role="tablist" aria-label="Mission type" className="inline-grid grid-cols-2 gap-1 rounded-full bg-bg p-1">
            {(["safety", "market"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`min-h-[36px] rounded-full px-4 text-[14px] font-bold ${tab === t ? "bg-card text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]" : "text-muted"}`}
              >
                {t === "safety" ? "Safety" : "Market practice"}
              </button>
            ))}
          </div>
          <div className="tabular pt-5 text-[40px] font-extrabold leading-none tracking-[-0.04em]">
            {tab === "safety" ? `${proven} of ${SKILLS.length}` : `${mp.done} of ${mp.total}`}
          </div>
          <div className="pt-1.5 text-[16px] font-semibold text-muted">
            {tab === "safety" ? "skills proven" : state.plan ? `done · for your ${planLabel(state.plan)} plan` : "done"}
          </div>
        </div>
      }
    >
      {tab === "market" ? (
        <>
          <div className="px-5 pt-5">
            {mp.next ? (
              <div className="rounded-[22px] bg-brand-tint p-[18px]">
                <div className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.025em]">{mp.next.title}</div>
                <div className="pt-1 text-[14.5px] text-body">{mp.next.sub}</div>
                <Link href={mp.next.href} className="btn btn-brand mt-4 !h-12">
                  Start
                </Link>
              </div>
            ) : (
              <div className="rounded-[22px] bg-brand-tint p-[18px]">
                <div className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.025em]">Market practice done</div>
                <div className="pt-1 text-[14.5px] text-body">The market is yours now. A real dip still counts when it comes.</div>
              </div>
            )}
          </div>
          <section aria-label="Market practice" className="px-5 pt-7">
            <div className="border-t border-line">
              {mp.steps.map((st) => {
                const done = !!state.market?.[st.id];
                const isNext = mp.next?.id === st.id;
                const row = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold">{st.title}</span>
                      {st.live && !done && <span className="block pt-0.5 text-[13px] text-muted">{st.sub}</span>}
                    </span>
                    <span className={`shrink-0 text-[14px] font-bold ${done ? "text-good-ink" : isNext ? "text-brand" : "text-muted"}`}>
                      {done ? "✓ Done" : st.live ? "Waiting" : isNext ? "Start ›" : "›"}
                    </span>
                  </>
                );
                return st.live ? (
                  <div key={st.id} className="flex min-h-[58px] items-center gap-3 border-b border-line py-3">
                    {row}
                  </div>
                ) : (
                  <Link key={st.id} href={st.href} className="flex min-h-[58px] items-center gap-3 border-b border-line py-3 active:bg-bg">
                    {row}
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
      <div className="px-5 pt-5">
        <NextStepCard only="safety" />
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
        </>
      )}
    </TabScreen>
  );
}
