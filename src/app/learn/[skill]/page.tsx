"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { go } from "@/lib/nav";
import { useState } from "react";
import { LessonVisual } from "@/components/lesson-visual";
import { SubHeader } from "@/components/ui";
import { skillStatus } from "@/lib/progress";
import { skillById } from "@/lib/skills";
import { useApp } from "@/lib/store";

export default function Learn() {
  const { skill: id } = useParams<{ skill: string }>();
  const skill = skillById(id);
  const { state, dispatch } = useApp();
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
          <h1 className="text-[23px] font-extrabold leading-[1.2] tracking-[-0.02em]">{check.q}</h1>
          <div className="mt-4 border-t border-line">
            {check.options.map((o, k) => {
              const show = picked !== null;
              const tone = show ? (o.correct && right ? "text-good-ink" : picked === k ? "text-bad-ink line-through" : "") : "";
              return (
                <button
                  key={o.label}
                  disabled={right}
                  onClick={() => setPicked(k)}
                  className={`flex min-h-[58px] w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left text-[16px] font-bold active:bg-bg ${tone}`}
                >
                  {o.label}
                  {show && o.correct && right ? <span className="text-[18px] font-black">✓</span> : <span className="text-[20px] text-faint">›</span>}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <p className={`anim-enter pt-4 text-[15px] font-semibold leading-[1.45] ${right ? "text-good-ink" : "text-body"}`}>
              {right ? "" : "Not quite. "}
              {check.why}
            </p>
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
              go(`/missions/${st.nextPractice}`);
            }}
            className="btn btn-brand flex-1 gap-2"
          >
            Lesson done · practice it
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
