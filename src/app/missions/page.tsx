"use client";

import Link from "next/link";
import { MissionCover, MissionThumb } from "@/components/covers";
import { CheckIcon, ChevronIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { TabScreen } from "@/components/shell";
import { MISSIONS } from "@/lib/missions";
import { readiness, upNext } from "@/lib/progress";
import { SKILLS } from "@/lib/skills";
import { useApp } from "@/lib/store";

const skillName = (id: string) => SKILLS.find((s) => s.id === id)?.name ?? id;

export default function Missions() {
  const { state } = useApp();
  const next = upNext(state);
  const r = readiness(state);
  const played = MISSIONS.filter((m) => state.missions[m.id]?.done).length;
  const clean = MISSIONS.filter((m) => state.missions[m.id]?.clean).length;

  return (
    <TabScreen
      title="Missions"
      hero={
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="tabular text-[34px] font-extrabold leading-none tracking-[-0.03em]">{played}</span>
            <span className="text-[15px] font-bold text-muted">of {MISSIONS.length} played</span>
            <span className="ml-auto text-[13px] font-bold text-up">{clean} clean</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {MISSIONS.map((m) => {
              const rec = state.missions[m.id];
              return <span key={m.id} className={`h-2 flex-1 rounded-full ${rec?.clean ? "bg-up" : rec?.done ? "bg-brand" : "bg-[#E2E0EA]"}`} />;
            })}
          </div>
          <p className="pt-3 text-[14px] leading-[1.5] text-muted">Real scams and slip-ups, rebuilt with fake money. Every run is a little different.</p>
        </div>
      }
    >
      {next && (
        <Link href={`/missions/${next.mission.id}`} className="overflow-hidden rounded-[24px] bg-white">
          <MissionCover id={next.mission.id} />
          <div className="flex flex-col gap-1 p-4">
            <span className="text-[12px] font-bold text-brand">{next.reason}</span>
            <span className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{next.mission.title}</span>
            <p className="text-[14px] leading-[1.45] text-muted">{next.mission.blurb}</p>
            <div className="flex items-center justify-between pt-3">
              <span className="text-[13px] font-semibold text-muted">
                {next.mission.minutes} min · earn ${next.mission.reward}
              </span>
              <span className="flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-bold text-white">Start</span>
            </div>
          </div>
        </Link>
      )}

      <section aria-labelledby="all" className="pt-2">
        <h2 id="all" className="px-1 pb-2 text-[20px] font-extrabold tracking-[-0.02em]">
          All missions
        </h2>
        <div className="rounded-[24px] bg-white px-4 py-1">
          {MISSIONS.map((m, i) => {
            const rec = state.missions[m.id];
            return (
              <Link key={m.id} href={`/missions/${m.id}`} className={`flex items-center gap-3.5 py-3.5 ${i ? "border-t border-line" : ""}`}>
                <MissionThumb mission={m} />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold leading-tight">{m.title}</div>
                  <div className="truncate pt-0.5 text-[13px] text-muted">
                    {m.minutes} min · {m.skills.map(skillName).join(", ")}
                  </div>
                </div>
                {rec?.clean ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-up" aria-label="Clean run">
                    <CheckIcon size={14} color="#fff" />
                  </span>
                ) : rec?.done ? (
                  <span className="text-[12px] font-bold text-down">Retry</span>
                ) : (
                  <span className="text-[13px] font-bold text-muted">${m.reward}</span>
                )}
                <ChevronIcon color="#C9C6D4" />
              </Link>
            );
          })}
        </div>
      </section>

      <Link href="/ready" className="flex items-center gap-3.5 rounded-[24px] bg-white p-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-brand-soft">
          {r.unlocked ? <ShieldIcon color="#5521F5" /> : <LockIcon size={22} color="#5521F5" />}
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-bold">Readiness check</div>
          <div className="text-[13px] text-muted">
            {state.readiness?.passed
              ? "Passed · try a real test send"
              : r.unlocked
                ? "Unlocked · 5 quick scenarios"
                : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} steps done to unlock`}
          </div>
        </div>
        <ChevronIcon color="#C9C6D4" />
      </Link>
    </TabScreen>
  );
}
