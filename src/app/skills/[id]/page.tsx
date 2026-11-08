"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MissionThumb } from "@/components/covers";
import { CheckIcon, ChevronIcon, LockIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { useUI } from "@/components/shell";
import { SubHeader } from "@/components/ui";
import { missionById } from "@/lib/missions";
import { skillStatus } from "@/lib/progress";
import { SKILLS, skillById } from "@/lib/skills";
import { HabitId, habits, useApp } from "@/lib/store";

const HABITS: Record<string, HabitId[]> = {
  setup: ["phrase"],
  sending: ["addresses"],
  receiving: [],
  scams: ["hype", "phrase"],
  trading: ["fees", "calm"],
};

const BUDDY_TOPIC: Record<string, string> = { setup: "phrase", sending: "address", receiving: "network", scams: "support", trading: "fees" };

export default function SkillPage() {
  const { id } = useParams<{ id: string }>();
  const skill = skillById(id);
  const { state } = useApp();
  const { openBuddy } = useUI();
  if (!skill) {
    return (
      <div className="p-4">
        <SubHeader back="/skills" />
        <p className="p-4">We couldn&apos;t find that skill.</p>
      </div>
    );
  }
  const st = skillStatus(state, skill);
  const n = SKILLS.indexOf(skill) + 1;
  const h = habits(state).list.filter((x) => HABITS[skill.id].includes(x.id));
  const mistakes = skill.practice.reduce((sum, mid) => sum + (state.missions[mid]?.mistakes ?? 0), 0);
  const prove = missionById(skill.prove)!;

  return (
    <div className="min-h-[var(--app-h)] pb-10">
      <SubHeader back="/missions" />
      <div className="flex flex-col gap-3 px-4">
        <div className="rounded-[28px] bg-card px-5 pb-5 pt-5">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-extrabold ${st.proven ? "bg-ink text-card" : "bg-brand text-white"}`}>
              {st.proven ? <ShieldIcon size={22} color="#fff" /> : n}
            </span>
            <span className="text-[13px] font-bold text-brand">Skill {n} of {SKILLS.length}</span>
          </div>
          <h1 className="pt-4 text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em]">{skill.name}</h1>
          <p className="pt-2 text-[16px] leading-[1.5] text-muted">{skill.about}</p>
          <div className="mt-4 rounded-[16px] bg-brand-tint px-4 py-3 text-[14px] font-semibold leading-[1.45] text-body">{skill.why}</div>
        </div>

        <div className="rounded-[24px] bg-card px-4 py-1">
          <StepRow
            n="1"
            title="Learn"
            sub={`${skill.lesson.cards.length} cards and a quick check · 1 min`}
            done={st.learned}
            current={st.step === "learn"}
            href={`/learn/${skill.id}`}
          />
          {skill.practice.map((mid, k) => {
            const m = missionById(mid)!;
            const clean = (state.missions[mid]?.clean ?? 0) > 0;
            return (
              <StepRow
                key={mid}
                n={k === 0 ? "2" : ""}
                title={k === 0 ? `Practice: ${m.title}` : m.title}
                sub={`${m.minutes} min · ${clean ? "clean run done" : state.missions[mid]?.done ? "try for a clean run" : "not played yet"}`}
                done={clean}
                current={st.step === "practice" && st.nextPractice === mid}
                locked={!st.learned}
                href={`/missions/${mid}`}
                thumb={<MissionThumb mission={m} size={40} />}
              />
            );
          })}
          <StepRow
            n="3"
            title={`Prove it: ${prove.title}`}
            sub="A new version, one try per step, no mistakes"
            done={st.proven}
            current={st.step === "prove"}
            locked={!st.practiced}
            href={`/missions/${skill.prove}?mode=prove`}
            last
          />
        </div>

        {(h.length > 0 || mistakes > 0) && (
          <div className="rounded-[24px] bg-card p-4">
            <div className="text-[16px] font-extrabold">Your record</div>
            {h.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
                <div>
                  <div className="text-[14px] font-bold">{x.name}</div>
                  <div className="text-[12px] text-muted">{x.progress}</div>
                </div>
                <span className={`text-[12px] font-bold ${x.status === "locked-in" ? "text-up" : x.status === "practicing" ? "text-brand" : "text-faint"}`}>
                  {x.status === "locked-in" ? "Locked in" : x.status === "practicing" ? "Practicing" : "Not yet"}
                </span>
              </div>
            ))}
            {mistakes > 0 && (
              <p className="pt-3 text-[13px] leading-[1.45] text-muted">
                You&apos;ve made {mistakes} mistake{mistakes === 1 ? "" : "s"} here in practice. Each one is a mistake you won&apos;t make with real money.
              </p>
            )}
          </div>
        )}

        <button onClick={() => openBuddy(BUDDY_TOPIC[skill.id])} className="flex items-center gap-3 rounded-[20px] bg-brand-tint px-4 py-3.5 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
            <SparkleIcon size={20} color="var(--color-brand)" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">Questions about this?</span>
            <span className="block text-[13px] text-muted">Ask Buddy</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function StepRow({
  n,
  title,
  sub,
  done,
  current,
  locked,
  href,
  last,
  thumb,
}: {
  n: string;
  title: string;
  sub: string;
  done: boolean;
  current: boolean;
  locked?: boolean;
  href: string;
  last?: boolean;
  thumb?: React.ReactNode;
}) {
  const body = (
    <>
      <span className="flex w-9 shrink-0 justify-center">
        {done ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-up">
            <CheckIcon size={15} color="#fff" />
          </span>
        ) : locked ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg">
            <LockIcon size={15} color="var(--color-faint)" />
          </span>
        ) : thumb ? (
          thumb
        ) : (
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-extrabold ${current ? "bg-brand text-white" : "bg-bg text-muted"}`}>{n}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-bold ${locked ? "text-faint" : ""}`}>{title}</span>
        <span className="block text-[13px] text-muted">{locked ? "Finish the step above first" : sub}</span>
      </span>
      {current && !locked ? (
        <span className="rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-bold text-white">Start</span>
      ) : (
        !locked && <ChevronIcon color="var(--color-faint)" />
      )}
    </>
  );
  const cls = `flex min-h-[64px] items-center gap-3 py-3 ${last ? "" : "border-b border-line"}`;
  return locked ? (
    <div className={cls} aria-disabled>
      {body}
    </div>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
