"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CheckIcon, SparkleIcon } from "@/components/icons";
import { LessonVisual } from "@/components/lesson-visual";
import { SubHeader } from "@/components/ui";
import { skillStatus } from "@/lib/progress";
import { skillById } from "@/lib/skills";
import { useApp } from "@/lib/store";

export default function Learn() {
  const { skill: id } = useParams<{ skill: string }>();
  const skill = skillById(id);
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  if (!skill) {
    return (
      <div className="p-4">
        <SubHeader back="/missions" />
        <p className="p-4">We couldn&apos;t find that lesson.</p>
      </div>
    );
  }
  const cards = skill.lesson.cards;
  const total = cards.length + 1;
  const onCheck = i === cards.length;
  const check = skill.lesson.check;
  const right = picked !== null && check.options[picked].correct;
  const st = skillStatus(state, skill);

  return (
    <div className="flex min-h-[var(--app-h)] flex-col bg-card">
      <SubHeader back={`/skills/${skill.id}`} title={`Learn · ${skill.short}`} right={<span className="pr-2 text-[13px] font-bold text-muted">{i + 1}/{total}</span>} />
      <div className="flex gap-1.5 px-5" aria-hidden>
        {Array.from({ length: total }, (_, k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-brand" : "bg-track"}`} />
        ))}
      </div>

      {!onCheck ? (
        <div key={i} className="anim-enter flex flex-1 flex-col px-6 pt-6">
          <LessonVisual kind={cards[i].visual} />
          <h1 className="pt-6 text-[28px] font-extrabold leading-[1.12] tracking-[-0.025em]">{cards[i].title}</h1>
          <p className="pt-3 text-[17px] leading-[1.55] text-body">{cards[i].body}</p>
        </div>
      ) : (
        <div className="anim-enter flex flex-1 flex-col px-5 pt-6">
          <div className="px-1 text-[13px] font-bold text-brand">Quick check</div>
          <h1 className="px-1 pt-1 text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">{check.q}</h1>
          <div className="flex flex-col gap-2.5 pt-5">
            {check.options.map((o, k) => {
              const show = picked !== null;
              const cls = show ? (o.correct ? "!border-up bg-up-soft" : picked === k ? "!border-down bg-down-soft" : "opacity-50") : "";
              return (
                <button key={o.label} disabled={right} onClick={() => setPicked(k)} className={`option min-h-[58px] px-4 py-3.5 text-[15px] font-bold ${cls}`}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="anim-enter mt-4 rounded-[18px] bg-bg p-4">
              <div className={`flex items-center gap-2 text-[13px] font-bold ${right ? "text-up" : "text-down"}`}>
                <SparkleIcon size={16} color={right ? "var(--color-up)" : "#C4320A"} /> {right ? "Right" : "Not quite, try again"}
              </div>
              <p className="pt-1 text-[14px] leading-[1.5] text-body">{check.why}</p>
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-0 flex gap-3 bg-card px-5 pb-[calc(16px+var(--safe-bottom))] pt-3">
        {i > 0 && !right && (
          <button
            onClick={() => {
              setI(i - 1);
              setPicked(null);
            }}
            className="btn btn-ghost !w-auto px-6"
          >
            Back
          </button>
        )}
        {!onCheck && (
          <button onClick={() => setI(i + 1)} className="btn btn-brand flex-1">
            Continue
          </button>
        )}
        {onCheck && right && (
          <button
            onClick={() => {
              dispatch({ type: "lesson", skill: skill.id });
              router.push(`/missions/${st.nextPractice}`);
            }}
            className="btn btn-brand flex-1 gap-2"
          >
            <CheckIcon size={18} color="#fff" /> Lesson done · practice it
          </button>
        )}
        {onCheck && !right && (
          <Link href={`/skills/${skill.id}`} className="btn btn-ghost flex-1">
            Back to the skill
          </Link>
        )}
      </div>
    </div>
  );
}
