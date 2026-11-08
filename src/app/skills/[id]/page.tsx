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

  const steps: { id: string; label: string; title: string; done: boolean; current: boolean; locked: boolean; href: string }[] = [
    { id: "learn", label: "1", title: "Learn", done: st.learned, current: st.step === "learn", locked: false, href: `/learn/${skill.id}` },
    ...skill.practice.map((mid, k) => {
      const m = missionById(mid)!;
      return {
        id: mid,
        label: k === 0 ? "2" : "",
        title: `Practice: ${m.title}`,
        done: (state.missions[mid]?.clean ?? 0) > 0,
        current: st.step === "practice" && st.nextPractice === mid,
        locked: !st.learned,
        href: `/missions/${mid}`,
      };
    }),
    { id: "prove", label: "3", title: `Prove it: ${prove.title}`, done: st.proven, current: st.step === "prove", locked: !st.practiced, href: `/missions/${skill.prove}?mode=prove` },
  ];

  return (
    <div className="min-h-[var(--app-h)] bg-card pb-10">
      <SubHeader back="/missions" />
      <div className="px-5 pt-1">
        <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">{skill.name}</h1>
        <p className="pt-2 text-[16px] leading-[1.5] text-body">{skill.about}</p>
        <p className="pt-2 text-[14px] leading-[1.45] text-muted">{skill.why}</p>
      </div>

      <section aria-labelledby="steps" className="px-5 pt-7">
        <h2 id="steps" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
          Skill {n} of {SKILLS.length}
        </h2>
        <div className="border-t border-line">
          {steps.map((x) => (
            <StepRow key={x.id} {...x} />
          ))}
        </div>
      </section>

      {(h.length > 0 || mistakes > 0) && (
        <section aria-labelledby="record" className="px-5 pt-7">
          <h2 id="record" className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">
            Your record
          </h2>
          <div className="border-t border-line">
            {h.map((x) => (
              <div key={x.id} className="flex min-h-[54px] items-center justify-between gap-4 border-b border-line py-3">
                <span className="text-[16px] font-bold">{x.name}</span>
                <span className={`shrink-0 text-[14px] font-bold ${x.status === "locked-in" ? "text-good-ink" : "text-muted"}`}>
                  {x.status === "locked-in" ? "✓ Locked in" : x.progress}
                </span>
              </div>
            ))}
            {mistakes > 0 && (
              <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-line py-3">
                <span className="text-[16px] font-bold">Mistakes made in practice</span>
                <span className="shrink-0 text-[14px] font-bold text-muted">{mistakes}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="px-5 pt-5">
        <button onClick={() => openBuddy(BUDDY_TOPIC[skill.id])} className="flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-brand">
          <SparkleIcon size={18} color="currentColor" /> Ask Buddy about this
        </button>
      </div>
    </div>
  );
}

function StepRow({ label, title, done, current, locked, href }: { id?: string; label: string; title: string; done: boolean; current: boolean; locked: boolean; href: string }) {
  const body = (
    <>
      <span
        className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ${
          done ? "bg-good text-white" : current ? "border-[1.5px] border-brand text-brand" : "border-[1.5px] border-track text-muted"
        }`}
      >
        {done ? "✓" : label || "·"}
      </span>
      <span className={`min-w-0 flex-1 text-[16px] font-bold ${locked ? "text-faint" : ""}`}>{title}</span>
      <span className={`shrink-0 text-[14px] font-bold ${done ? "text-good-ink" : current ? "text-brand" : "text-faint"}`}>
        {done ? "Done" : current ? "Start ›" : locked ? "Locked" : "›"}
      </span>
    </>
  );
  const cls = "flex min-h-[58px] items-center gap-3.5 border-b border-line py-3";
  return locked ? (
    <div className={cls} aria-disabled>
      {body}
    </div>
  ) : (
    <Link href={href} className={`${cls} active:bg-bg`}>
      {body}
    </Link>
  );
}
