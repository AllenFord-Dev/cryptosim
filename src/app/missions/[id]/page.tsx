"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { MissionCover } from "@/components/covers";
import { CheckIcon, LockIcon, ShieldIcon, SparkleIcon, WalletIcon } from "@/components/icons";
import { Visuals } from "@/components/visuals";
import { Chip, Sheet, SubHeader } from "@/components/ui";
import { MissionDef, Option, missionById, seeded } from "@/lib/missions";
import { skillStatus } from "@/lib/progress";
import { SkillId, skillById } from "@/lib/skills";
import { useApp } from "@/lib/store";

type Result = { mistakes: number; reward: number; loss: number; prove: boolean };
type Phase = { kind: "intro" } | { kind: "play"; seed: number } | ({ kind: "done" } & Result);

export default function MissionPage() {
  return (
    <Suspense>
      <MissionInner />
    </Suspense>
  );
}

function MissionInner() {
  const { id } = useParams<{ id: string }>();
  const prove = useSearchParams().get("mode") === "prove";
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
  if (phase.kind === "intro") return <Intro mission={mission} prove={prove} onStart={() => setPhase({ kind: "play", seed: Date.now() })} />;
  if (phase.kind === "play")
    return <Play key={phase.seed} mission={mission} seed={phase.seed} prove={prove} onDone={(r) => setPhase({ kind: "done", ...r })} />;
  return <Done mission={mission} result={phase} onReplay={() => setPhase({ kind: "play", seed: Date.now() })} />;
}

function Intro({ mission, prove, onStart }: { mission: MissionDef; prove: boolean; onStart: () => void }) {
  const { state } = useApp();
  const rec = state.missions[mission.id];
  const skill = skillById(mission.skills[0])!;
  const st = skillStatus(state, skill);
  const locked = prove ? !st.practiced : !st.learned;

  return (
    <div className="flex min-h-[var(--app-h)] flex-col">
      <SubHeader back={`/skills/${skill.id}`} />
      <div className="anim-enter flex flex-1 flex-col px-5 pt-2">
        <div className="relative overflow-hidden rounded-[24px]">
          <MissionCover id={mission.id} />
          {prove && (
            <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white">
              <ShieldIcon size={14} color="#fff" /> Prove it
            </span>
          )}
        </div>
        <div className="pt-5 text-[13px] font-bold text-brand">
          {prove ? "Prove" : "Practice"} · {skill.name} · {mission.minutes} min
        </div>
        <h1 className="pt-1 text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">{prove ? `Prove it: ${mission.title}` : mission.title}</h1>
        <p className="pt-3 text-[16px] leading-[1.5] text-muted">{mission.blurb}</p>

        <div className="mt-5 flex flex-col gap-2.5 rounded-[20px] bg-white p-4">
          {prove ? (
            <>
              <Rule>A new version you haven&apos;t seen.</Rule>
              <Rule>One try per step. No retries.</Rule>
              <Rule>Finish without a mistake to prove the skill.</Rule>
            </>
          ) : (
            <>
              <Rule>Every run changes the names, amounts and details.</Rule>
              <Rule>Make a mistake and Buddy explains it, then you retry.</Rule>
              <Rule>A clean run counts as practiced.</Rule>
            </>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-[16px] bg-white px-4 py-3">
            <div className="text-[12px] font-semibold text-muted">Clean run</div>
            <div className="text-[17px] font-extrabold text-up">+${mission.reward}</div>
          </div>
          <div className="rounded-[16px] bg-white px-4 py-3">
            <div className="text-[12px] font-semibold text-muted">If you slip</div>
            <div className="text-[17px] font-extrabold text-down">{mission.loss ? `−$${mission.loss}` : "Lesson only"}</div>
          </div>
        </div>
        {rec && <p className="pt-4 text-[13px] text-muted">You&apos;ve played this {rec.done}×.</p>}
      </div>
      <div className="sticky bottom-0 bg-bg/90 px-5 pb-[calc(16px+var(--safe-bottom))] pt-3 backdrop-blur">
        {locked ? (
          <Link href={prove ? `/missions/${mission.id}` : `/learn/${skill.id}`} className="btn btn-dark gap-2">
            <LockIcon size={18} color="#fff" /> {prove ? "Practice it cleanly first" : "Take the 1-minute lesson first"}
          </Link>
        ) : (
          <button onClick={onStart} className="btn btn-brand">
            {prove ? "Start the challenge" : rec ? "Play a new variation" : "Start mission"}
          </button>
        )}
      </div>
    </div>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-body">
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
      {children}
    </div>
  );
}

function Play({ mission, seed, prove, onDone }: { mission: MissionDef; seed: number; prove: boolean; onDone: (r: Result) => void }) {
  const { state, dispatch } = useApp();
  const steps = useMemo(() => mission.build(seeded(seed)), [mission, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Option | null>(null);
  const [wrong, setWrong] = useState<Option | null>(null);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [missed, setMissed] = useState(false);
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
    const clean = mistakes === 0;
    const replay = (state.missions[mission.id]?.done ?? 0) > 0;
    const reward = clean ? (replay || prove ? Math.round(mission.reward / 2) : mission.reward) : 0;
    const loss = clean ? 0 : mission.loss;
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
    onDone({ mistakes, reward, loss, prove });
  };

  const canAdvance = !!picked || missed;

  return (
    <div className="flex min-h-[var(--app-h)] flex-col">
      <SubHeader
        back="/missions"
        title={prove ? "Prove it" : mission.title}
        right={
          <span className="pr-2 text-[13px] font-bold text-muted">
            {i + 1}/{steps.length}
          </span>
        }
      />
      <div className="px-5">
        <div className="flex gap-1.5" aria-hidden>
          {steps.map((s, k) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${k < i || (k === i && canAdvance) ? (prove ? "bg-ink" : "bg-brand") : k === i ? "bg-brand/40" : "bg-[#E2E0EA]"}`} />
          ))}
        </div>
      </div>

      <div key={step.id} className="anim-enter flex flex-1 flex-col gap-4 px-4 pb-6 pt-5">
        <div className="px-1">
          <div className="text-[13px] font-bold text-brand">{step.kicker}</div>
          <h1 className="pt-1 text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">{step.prompt}</h1>
        </div>
        <Visuals visuals={step.visuals} />
        <div className="flex flex-col gap-2.5" role="group" aria-label="Choices">
          {step.options.map((o) => {
            const isPicked = picked?.id === o.id;
            const isTried = tried.has(o.id);
            const reveal = missed && o.correct;
            const cls = isPicked || reveal ? "!border-up bg-up-soft" : isTried ? (prove ? "!border-down bg-down-soft" : "opacity-45 line-through decoration-down/60") : picked || missed ? "opacity-45" : "";
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                disabled={!!picked || missed || isTried}
                className={`option flex min-h-[58px] items-center justify-between gap-3 px-4 py-3.5 ${cls}`}
              >
                <span className="flex flex-col">
                  <span className={`${o.mono ? "font-mono text-[13px] leading-[1.5] tracking-tight" : "text-[15px]"} font-bold`}>{o.label}</span>
                  {o.detail && <span className="text-[13px] text-muted">{o.detail}</span>}
                </span>
                {(isPicked || reveal) && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-up">
                    <CheckIcon size={14} color="#fff" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="anim-enter rounded-[18px] bg-white p-4">
            <div className="text-[13px] font-bold text-up">Good call</div>
            <p className="pt-1 text-[14px] leading-[1.5] text-body">{picked.good}</p>
          </div>
        )}
        {missed && !wrong && (
          <div className="anim-enter rounded-[18px] bg-white p-4">
            <div className="text-[13px] font-bold text-down">Not this time</div>
            <p className="pt-1 text-[14px] leading-[1.5] text-body">{correct.good}</p>
          </div>
        )}
      </div>

      {canAdvance && !wrong && (
        <div className="sticky bottom-0 bg-bg/90 px-5 pb-[calc(16px+var(--safe-bottom))] pt-3 backdrop-blur">
          <button onClick={advance} className="btn btn-brand anim-enter">
            {last ? "Finish" : "Continue"}
          </button>
        </div>
      )}

      <Sheet open={!!wrong} onClose={() => setWrong(null)} label="What happened">
        {wrong?.mistake && (
          <div className="flex flex-col gap-3 pt-2">
            <Chip tone="bad">{prove ? "Challenge missed" : "Mistake"}</Chip>
            <h2 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em]">{wrong.mistake.title}</h2>
            <div className="rounded-[18px] bg-bg p-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-brand">
                <SparkleIcon size={16} color="#5521F5" /> Buddy explains
              </div>
              <p className="pt-1 text-[15px] leading-[1.5] text-body">{wrong.mistake.why}</p>
            </div>
            <div className="flex gap-3 rounded-[18px] border border-line p-4">
              <WalletIcon size={20} color="#C4320A" />
              <div>
                <div className="text-[13px] font-bold text-down">In a real wallet</div>
                <p className="pt-0.5 text-[14px] leading-[1.5] text-body">{wrong.mistake.real}</p>
              </div>
            </div>
            <button onClick={() => setWrong(null)} className="btn btn-dark mt-1">
              {prove ? "See the right answer" : "Try that step again"}
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Done({ mission, result, onReplay }: { mission: MissionDef; result: Result; onReplay: () => void }) {
  const { state } = useApp();
  const clean = result.mistakes === 0;
  const skill = skillById(mission.skills[0])!;
  const st = skillStatus(state, skill);
  const proven = result.prove && clean;
  const nextHref = st.step === "prove" ? `/missions/${skill.prove}?mode=prove` : `/skills/${skill.id}`;

  return (
    <div className="flex min-h-[var(--app-h)] flex-col">
      <SubHeader back="/missions" />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
        <div className="flex flex-col items-center rounded-[28px] bg-white px-5 pb-6 pt-7 text-center">
          <div className={`anim-pop flex h-16 w-16 items-center justify-center rounded-full ${proven ? "bg-ink" : clean ? "bg-up" : "bg-brand"}`}>
            {proven ? <ShieldIcon size={30} color="#fff" /> : clean ? <CheckIcon size={30} color="#fff" /> : <SparkleIcon size={30} color="#fff" />}
          </div>
          <div className="pt-4 text-[13px] font-bold text-muted">{skill.name}</div>
          <h1 className="pt-1 text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em]">
            {proven ? "Skill proven" : result.prove ? "Not proven yet" : clean ? "Clean run" : `Done, with ${result.mistakes} mistake${result.mistakes === 1 ? "" : "s"}`}
          </h1>
          <p className="pt-2 text-[15px] leading-[1.5] text-muted">
            {proven
              ? "A version you'd never seen, no retries, no mistakes. You've rehearsed this moment."
              : result.prove
                ? "Close. Practice once more, then take the challenge again. It changes every time."
                : clean
                  ? "You didn't fall for anything. That counts as practiced."
                  : "Better here than with real money. Play again for a clean run."}
          </p>
          <div className="mt-4 flex gap-2">
            {result.reward > 0 && <Chip tone="good">+${result.reward} practice money</Chip>}
            {result.loss > 0 && <Chip tone="bad">−${result.loss} practice money lost</Chip>}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4">
          <div className="flex items-center gap-2 text-[16px] font-extrabold">
            <WalletIcon size={20} color="#5521F5" /> {mission.realWallet.title}
          </div>
          <ul className="flex flex-col gap-2.5 pt-3">
            {mission.realWallet.points.map((pt) => (
              <li key={pt} className="flex gap-2.5 text-[14px] leading-[1.5] text-body">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {pt}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sticky bottom-0 flex flex-col gap-2.5 bg-bg/90 px-5 pb-[calc(16px+var(--safe-bottom))] pt-3 backdrop-blur">
        {st.step === "prove" && !result.prove ? (
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
  );
}
