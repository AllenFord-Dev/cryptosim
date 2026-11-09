"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SparkleIcon } from "@/components/icons";
import { Visuals } from "@/components/visuals";
import { WalletMission } from "@/components/wallet-mission";
import { Sheet, SubHeader } from "@/components/ui";
import { MissionDef, Option, missionById, seeded } from "@/lib/missions";
import { skillStatus } from "@/lib/progress";
import { SkillId, skillById } from "@/lib/skills";
import { useApp } from "@/lib/store";

type StepLog = { step: string; ok: boolean; note?: string };
type Result = { mistakes: number; reward: number; loss: number; prove: boolean; log: StepLog[] };
type Phase = { kind: "intro" } | { kind: "play"; seed: number } | ({ kind: "done" } & Result);

export default function MissionPage() {
  return (
    <Suspense>
      <MissionInner />
    </Suspense>
  );
}

// Practice and prove are the same page with a different ?mode, so remount when the query changes
// (otherwise "Next: prove it" would keep showing the finished practice run).
function MissionInner() {
  const params = useSearchParams();
  return <MissionBody key={params.toString()} />;
}

function MissionBody() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const prove = params.get("mode") === "prove";
  const starter = params.get("starter") === "1";
  const mission = missionById(id);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });

  if (!mission) {
    return (
      <div className="p-4">
        <SubHeader back="/missions" />
        <p className="p-4 text-[16px]">We couldn&apos;t find that mission.</p>
      </div>
    );
  }
  if (phase.kind === "intro") return <Intro mission={mission} prove={prove} starter={starter} onStart={() => setPhase({ kind: "play", seed: Date.now() })} />;
  if (phase.kind === "play" && mission.id === "pay-back")
    return <PayBackPlay key={phase.seed} mission={mission} seed={phase.seed} prove={prove} starter={starter} onDone={(r) => setPhase({ kind: "done", ...r })} />;
  if (phase.kind === "play")
    return <Play key={phase.seed} mission={mission} seed={phase.seed} prove={prove} starter={starter} onDone={(r) => setPhase({ kind: "done", ...r })} />;
  return <Done mission={mission} result={phase} starter={starter} onReplay={() => setPhase({ kind: "play", seed: Date.now() })} />;
}

function Intro({ mission, prove, starter, onStart }: { mission: MissionDef; prove: boolean; starter: boolean; onStart: () => void }) {
  const { state } = useApp();
  const rec = state.missions[mission.id];
  const skill = skillById(mission.skills[0])!;
  const st = skillStatus(state, skill);
  const locked = starter ? false : prove ? !st.practiced : !st.learned;
  const rows: [string, React.ReactNode][] = [
    ["Skill", skill.name],
    ["Time", `About ${mission.minutes} minutes`],
    [prove ? "Rules" : "Each run", prove ? "One try per step" : "New names and details"],
    ["A slip in real life", mission.loss ? <span key="l" className="text-down">Up to −${mission.loss}</span> : "No money lost"],
  ];
  if (rec) rows.push(["Played", `${rec.done} time${rec.done === 1 ? "" : "s"}`]);

  return (
    <div className="flex min-h-[var(--app-h)] flex-col bg-card">
      <SubHeader back={starter ? "/" : `/skills/${skill.id}`} />
      <div className="anim-enter flex flex-1 flex-col px-5 pt-2">
        {starter && <div className="pb-2 text-[13px] font-bold text-brand">Tutorial · Part 2 of 3</div>}
        <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">{prove ? `Prove it: ${mission.title}` : mission.title}</h1>
        <p className="pt-3 text-[16px] leading-[1.5] text-body">{prove ? "A version you haven't seen. Finish without a mistake to prove the skill." : mission.blurb}</p>
        <div className="mt-6 border-t border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex min-h-[52px] items-center justify-between gap-4 border-b border-line py-3 text-[16px]">
              <span className="font-semibold text-muted">{k}</span>
              <span className="text-right font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 bg-card px-5 pb-[calc(16px+var(--safe-bottom))] pt-3">
        {locked ? (
          <Link href={prove ? `/missions/${mission.id}` : `/learn/${skill.id}`} className="btn btn-brand">
            {prove ? "Practice it cleanly first" : "Take the 1-minute lesson first"}
          </Link>
        ) : (
          <button onClick={onStart} className="btn btn-brand">
            {prove ? "Start the challenge" : rec ? "Play a new variation" : "Start"}
          </button>
        )}
      </div>
    </div>
  );
}


// Records the result of a finished mission (shared by the quiz-style and wallet-style missions).
function useFinish(mission: MissionDef, prove: boolean, starter: boolean | undefined, onDone: (r: Result) => void) {
  const { state, dispatch } = useApp();
  return (mistakes: number, log: StepLog[], lossOverride?: number) => {
    const clean = mistakes === 0;
    const replay = (state.missions[mission.id]?.done ?? 0) > 0;
    const reward = clean ? (replay || prove ? Math.round(mission.reward / 2) : mission.reward) : 0;
    const loss = lossOverride ?? (clean ? 0 : mission.loss);
    const skill = mission.skills[0] as SkillId;
    dispatch({
      type: "mission",
      id: mission.id,
      mistakes,
      reward,
      loss,
      skillDeltas: { [skill]: clean ? 20 : 8 },
      hype: mission.flag === "hype" ? (clean ? "resisted" : "fell") : undefined,
      phrase: mission.flag === "phrase" ? (clean ? "kept" : "shared") : undefined,
      prove: prove ? skill : undefined,
    });
    if (starter) dispatch({ type: "starter" });
    onDone({ mistakes, reward, loss, prove, log });
  };
}

function PayBackPlay({ mission, seed, prove, starter, onDone }: { mission: MissionDef; seed: number; prove: boolean; starter?: boolean; onDone: (r: Result) => void }) {
  const { dispatch } = useApp();
  const finish = useFinish(mission, prove, starter, onDone);
  return (
    <WalletMission
      seed={seed}
      prove={prove}
      onMistake={(m) => dispatch({ type: "mistake", mistake: { mission: mission.id, title: m.title, why: m.why, at: Date.now() } })}
      onFinish={finish}
    />
  );
}

function Play({ mission, seed, prove, starter, onDone }: { mission: MissionDef; seed: number; prove: boolean; starter?: boolean; onDone: (r: Result) => void }) {
  const { dispatch } = useApp();
  const finish = useFinish(mission, prove, starter, onDone);
  const steps = useMemo(() => mission.build(seeded(seed)), [mission, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Option | null>(null);
  const [wrong, setWrong] = useState<Option | null>(null);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [missed, setMissed] = useState(false);
  const [misses, setMisses] = useState<Record<number, string>>({});
  const step = steps[i];
  const last = i === steps.length - 1;
  const correct = step.options.find((o) => o.correct)!;

  const choose = (o: Option) => {
    if (picked || missed) return;
    if (o.correct) {
      setPicked(o);
    } else {
      setWrong(o);
      setTried(new Set(tried).add(o.id));
      setMistakes((m) => m + 1);
      setMisses((ms) => (ms[i] ? ms : { ...ms, [i]: o.mistake?.title ?? "Missed" }));
      if (prove) setMissed(true);
      if (o.mistake) dispatch({ type: "mistake", mistake: { mission: mission.id, title: o.mistake.title, why: o.mistake.why, at: Date.now() } });
    }
  };

  const advance = () => {
    if (!last) {
      setI(i + 1);
      setPicked(null);
      setMissed(false);
      setTried(new Set());
      document.querySelector(".app-scroll")?.scrollTo(0, 0);
      window.scrollTo(0, 0);
      return;
    }
    finish(
      mistakes,
      steps.map((st, k) => ({ step: st.kicker.split("·").pop()!.trim(), ok: !misses[k], note: misses[k] })),
    );
  };

  const canAdvance = !!picked || missed;

  return (
    <div className="flex min-h-[var(--app-h)] flex-col bg-card pt-[calc(6px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-between px-3">
        <Link href="/missions" aria-label="Leave mission" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[16px] font-bold">{prove ? `Prove it: ${mission.title}` : mission.title}</span>
        <span className="w-11 pr-1 text-right text-[13px] font-bold text-faint">
          {i + 1} of {steps.length}
        </span>
      </div>

      <div key={step.id} className="anim-enter flex flex-1 flex-col gap-4 px-5 pb-6 pt-3">
        <h1 className="text-[23px] font-extrabold leading-[1.18] tracking-[-0.02em]">{step.prompt}</h1>
        <Visuals visuals={step.visuals} />
        <div className="border-t border-line" role="group" aria-label="Choices">
          {step.options.map((o) => {
            const isPicked = picked?.id === o.id;
            const isTried = tried.has(o.id);
            const reveal = missed && o.correct;
            const tone = isPicked || reveal ? "text-good-ink" : isTried ? "text-faint line-through" : picked || missed ? "text-faint" : "";
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                disabled={!!picked || missed || isTried}
                className={`flex min-h-[58px] w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left active:bg-bg ${tone}`}
              >
                <span className="flex flex-col">
                  <span className={`${o.mono ? "font-mono text-[13.5px] leading-[1.5] tracking-tight" : "text-[16px]"} font-bold`}>{o.label}</span>
                  {o.detail && <span className="text-[13px] font-medium text-muted">{o.detail}</span>}
                </span>
                {isPicked || reveal ? (
                  <span className="shrink-0 text-[18px] font-black text-good-ink">✓</span>
                ) : (
                  !picked && !missed && !isTried && <span className="shrink-0 text-[20px] text-faint">›</span>
                )}
              </button>
            );
          })}
        </div>
        {picked && <p className="anim-enter text-[15px] font-semibold leading-[1.45] text-good-ink">{picked.good}</p>}
        {missed && !wrong && <p className="anim-enter text-[15px] font-semibold leading-[1.45] text-body">{correct.good}</p>}
      </div>

      {canAdvance && !wrong && (
        <div className="sticky bottom-0 bg-card px-5 pb-[calc(16px+var(--safe-bottom))] pt-3">
          <button onClick={advance} className="btn btn-brand anim-enter">
            {last ? "Finish" : "Continue"}
          </button>
        </div>
      )}

      <Sheet open={!!wrong} onClose={() => setWrong(null)} label="What happened">
        {wrong?.mistake && (
          <div className="flex flex-col gap-3 pt-1">
            <h2 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-bad-ink">{wrong.mistake.title}</h2>
            <p className="text-[16px] font-semibold leading-[1.45]">{wrong.mistake.real}</p>
            <div className="rounded-[16px] bg-brand-tint px-3.5 py-3 text-[15px] leading-[1.42] text-body">
              <div className="flex items-center gap-1.5 pb-1 text-[13px] font-extrabold text-brand">
                <SparkleIcon size={16} color="currentColor" /> Buddy
              </div>
              {wrong.mistake.why}
            </div>
            <button onClick={() => setWrong(null)} className="btn btn-brand mt-1">
              {prove ? "See the right answer" : "Try that step again"}
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Done({ mission, result, starter, onReplay }: { mission: MissionDef; result: Result; starter?: boolean; onReplay: () => void }) {
  const { state } = useApp();
  const clean = result.mistakes === 0;
  const skill = skillById(mission.skills[0])!;
  const st = skillStatus(state, skill);
  const proven = result.prove && clean;
  const nextHref = st.step === "prove" ? `/missions/${skill.prove}?mode=prove` : `/skills/${skill.id}`;
  const title = proven ? "Skill proven" : result.prove ? "Not proven yet" : clean ? "Clean run" : `${result.mistakes} mistake${result.mistakes === 1 ? "" : "s"}`;
  const skillState = proven || st.proven ? "Proven" : st.practiced ? "Practiced" : "Practice again for a clean run";

  return (
    <div className="anim-enter flex min-h-[var(--app-h)] flex-col bg-card pb-[calc(20px+var(--safe-bottom))] pt-[calc(6px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-between px-3">
        <Link href="/missions" aria-label="Close" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[16px] font-bold">{mission.title}</span>
        <span className="w-11" />
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 pb-6 pt-6 text-center">
        <h1 className={`text-[40px] font-extrabold leading-none tracking-[-0.04em] ${proven || clean ? "text-ink" : "text-bad-ink"}`}>{title}</h1>
        <p className="pt-3 text-[16px] leading-[1.4] text-body">
          {proven
            ? "A version you'd never seen, with no retries."
            : result.prove
              ? "Practice once more, then try again. It changes every time."
              : clean
                ? "You didn't fall for anything."
                : "Better here than with real money."}
        </p>
      </div>

      <div className="px-5">
        <div className="border-t border-line">
          {result.log.map((l) => (
            <div key={l.step} className="flex min-h-[54px] items-center justify-between gap-4 border-b border-line py-3 text-[16px]">
              <span className="shrink-0 font-semibold text-muted">{l.step}</span>
              <span className={`text-right font-bold ${l.ok ? "text-good-ink" : "text-bad-ink"}`}>{l.ok ? "✓ Right" : l.note}</span>
            </div>
          ))}
          <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-line py-3 text-[16px]">
            <span className="font-semibold text-muted">If this were real</span>
            <span className={`tabular font-extrabold ${result.loss > 0 ? "text-down" : "text-ink"}`}>{result.loss > 0 ? `−$${result.loss} lost` : "Nothing lost"}</span>
          </div>
          <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-line py-3 text-[16px]">
            <span className="shrink-0 font-semibold text-muted">{skill.name}</span>
            <span className="text-right font-bold">{skillState}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 pt-6">
          {starter ? (
            <Link href="/" className="btn btn-brand">
              Next: your plan · last part
            </Link>
          ) : st.step === "prove" && !result.prove ? (
            <Link href={nextHref} className="btn btn-brand">
              Next: prove it
            </Link>
          ) : (
            <Link href="/missions" className="btn btn-brand">
              Back to your path
            </Link>
          )}
          <button onClick={onReplay} className="btn btn-ghost">
            {result.prove && !clean ? "Try the challenge again" : "Play a new variation"}
          </button>
        </div>
      </div>
    </div>
  );
}
