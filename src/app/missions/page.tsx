"use client";

import Link from "next/link";
import { MissionIcon } from "@/components/bits";
import { CheckIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { TabScreen } from "@/components/shell";
import { Chip } from "@/components/ui";
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

  return (
    <TabScreen
      title="Missions"
      hero={
        <div className="px-6 pb-5 pt-4">
          <p className="text-[15px] leading-[1.5] text-muted">
            Each mission recreates a real mistake or scam. Mess up and it only costs practice money, and Buddy explains what happened.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {MISSIONS.map((m) => (
                <span key={m.id} className={`h-2 flex-1 rounded-full ${state.missions[m.id]?.done ? "bg-brand" : "bg-[#E2E0EA]"}`} />
              ))}
            </div>
            <span className="text-[13px] font-bold text-muted">
              {played} of {MISSIONS.length} played
            </span>
          </div>
        </div>
      }
    >
      {MISSIONS.map((m) => {
        const rec = state.missions[m.id];
        const isNext = next?.mission.id === m.id;
        return (
          <Link
            key={m.id}
            href={`/missions/${m.id}`}
            className={`flex flex-col gap-3 rounded-[20px] bg-white p-4 ${isNext ? "ring-2 ring-brand" : ""}`}
          >
            <div className="flex items-start gap-3">
              <MissionIcon icon={m.icon} />
              <div className="min-w-0 flex-1">
                {isNext && <div className="text-[12px] font-bold text-brand">{next.reason}</div>}
                <div className="text-[16px] font-extrabold leading-tight">{m.title}</div>
                <p className="pt-1 text-[13px] leading-[1.45] text-muted">{m.blurb}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {m.skills.map((s) => (
                <Chip key={s}>{skillName(s)}</Chip>
              ))}
              <span className="ml-auto text-[12px] font-semibold text-muted">
                {m.minutes} min · ${m.reward}
              </span>
            </div>
            {rec && (
              <div className="flex items-center gap-2 border-t border-line pt-3 text-[13px] font-semibold">
                {rec.clean > 0 ? (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-up">
                      <CheckIcon size={12} color="#fff" />
                    </span>
                    <span>Clean run</span>
                  </>
                ) : (
                  <span className="text-down">
                    Played {rec.done}× · {rec.mistakes} mistake{rec.mistakes === 1 ? "" : "s"} so far
                  </span>
                )}
                <span className="ml-auto text-brand">Play a new variation</span>
              </div>
            )}
          </Link>
        );
      })}

      <Link href="/ready" className="flex items-center gap-3 rounded-[20px] bg-white p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-bg">
          {r.unlocked ? <ShieldIcon color="#5521F5" /> : <LockIcon size={20} color="#8A8796" />}
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-extrabold">Readiness check</div>
          <div className="text-[13px] text-muted">
            {state.readiness?.passed
              ? "Passed · try a real test send"
              : r.unlocked
                ? "Unlocked · 5 quick scenarios"
                : `${r.reqs.filter((x) => x.done).length} of ${r.reqs.length} requirements met`}
          </div>
        </div>
      </Link>
    </TabScreen>
  );
}
