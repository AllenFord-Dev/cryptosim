"use client";

import Link from "next/link";
import { MissionCover } from "@/components/covers";
import { CheckIcon, ChevronIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { TabScreen } from "@/components/shell";
import { missionById } from "@/lib/missions";
import { readiness, skillStatus, upNext } from "@/lib/progress";
import { SKILLS } from "@/lib/skills";
import { useApp } from "@/lib/store";

const STEPS = ["Learn", "Practice", "Prove"] as const;

export default function Missions() {
  const { state } = useApp();
  const next = upNext(state);
  const r = readiness(state);
  const statuses = SKILLS.map((s) => ({ skill: s, ...skillStatus(state, s) }));
  const proven = statuses.filter((s) => s.proven).length;

  return (
    <TabScreen
      title="Missions"
      hero={
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="tabular text-[34px] font-extrabold leading-none tracking-[-0.03em]">{proven}</span>
            <span className="text-[15px] font-bold text-muted">of {SKILLS.length} skills proven</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {statuses.map((s) => (
              <span key={s.skill.id} className="flex flex-1 gap-[3px]">
                {[0, 1, 2].map((k) => (
                  <span key={k} className={`h-2 flex-1 rounded-full ${k < s.done ? (s.proven ? "bg-ink" : "bg-brand") : "bg-[#E2E0EA]"}`} />
                ))}
              </span>
            ))}
          </div>
          <p className="pt-3 text-[14px] leading-[1.5] text-muted">Five skills every first-timer needs. Learn each one, practice it, then prove it on a version you&apos;ve never seen.</p>
        </div>
      }
    >
      {next && (
        <Link href={next.target.href} className="overflow-hidden rounded-[24px] bg-white">
          {next.step === "learn" ? (
            <div className="flex h-[120px] items-center gap-4 bg-brand-tint px-5">
              <span className="text-[44px] font-extrabold tracking-[-0.04em] text-brand">{SKILLS.indexOf(next.skill) + 1}</span>
              <span className="text-[14px] font-bold leading-[1.4] text-body">{next.skill.why}</span>
            </div>
          ) : (
            <MissionCover id={next.step === "prove" ? next.skill.prove : next.nextPractice} />
          )}
          <div className="flex flex-col gap-1 p-4">
            <span className="text-[12px] font-bold text-brand">
              Up next · {next.target.label} · {next.skill.name}
            </span>
            <span className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{next.target.title}</span>
            <p className="text-[14px] leading-[1.45] text-muted">{next.step === "learn" ? next.skill.about : missionById(next.step === "prove" ? next.skill.prove : next.nextPractice)?.blurb}</p>
            <div className="flex items-center justify-between pt-3">
              <span className="text-[13px] font-semibold text-muted">{next.target.minutes} min</span>
              <span className="flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-bold text-white">{next.target.label}</span>
            </div>
          </div>
        </Link>
      )}

      <section aria-labelledby="path" className="pt-2">
        <h2 id="path" className="px-1 pb-2 text-[20px] font-extrabold tracking-[-0.02em]">
          Your path
        </h2>
        <div className="flex flex-col gap-2.5">
          {statuses.map((s, idx) => (
            <Link key={s.skill.id} href={`/skills/${s.skill.id}`} className="flex flex-col gap-3 rounded-[22px] bg-white p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${
                    s.proven ? "bg-ink text-white" : s.done > 0 ? "bg-brand text-white" : "bg-bg text-muted"
                  }`}
                >
                  {s.proven ? <ShieldIcon size={18} color="#fff" /> : idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold leading-tight">{s.skill.name}</div>
                  <div className="truncate pt-0.5 text-[13px] text-muted">{s.skill.about}</div>
                </div>
                <ChevronIcon color="#C9C6D4" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {STEPS.map((label, k) => {
                  const done = k === 0 ? s.learned : k === 1 ? s.practiced : s.proven;
                  const current = s.step === label.toLowerCase();
                  return (
                    <span
                      key={label}
                      className={`flex h-8 items-center justify-center gap-1 rounded-full text-[12px] font-bold ${
                        done ? (k === 2 ? "bg-ink text-white" : "bg-brand text-white") : current ? "bg-brand-soft text-brand ring-1 ring-brand/30" : "bg-bg text-faint"
                      }`}
                    >
                      {done && <CheckIcon size={11} color="#fff" />}
                      {!done && !current && <LockIcon size={11} color="#A3A0AE" />}
                      {label}
                    </span>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/ready" className="flex items-center gap-3.5 rounded-[22px] bg-white p-4">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-brand-soft">
          {r.unlocked ? <ShieldIcon color="#5521F5" /> : <LockIcon size={22} color="#5521F5" />}
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-bold">Readiness check</div>
          <div className="text-[13px] text-muted">
            {state.readiness?.passed ? "Passed · try a real test send" : r.unlocked ? "Unlocked · 5 quick scenarios" : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} steps done to unlock`}
          </div>
        </div>
        <ChevronIcon color="#C9C6D4" />
      </Link>
    </TabScreen>
  );
}

