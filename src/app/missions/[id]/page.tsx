"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MissionIcon } from "@/components/bits";
import { CheckIcon, SparkleIcon, WalletIcon } from "@/components/icons";
import { Visuals } from "@/components/visuals";
import { Bar, Chip, Sheet, SubHeader } from "@/components/ui";
import { MissionDef, Option, missionById, seeded } from "@/lib/missions";
import { SKILLS, SkillId, levelOf } from "@/lib/skills";
import { useApp } from "@/lib/store";

type Phase = { kind: "intro" } | { kind: "play"; seed: number } | { kind: "done"; mistakes: number; deltas: Partial<Record<SkillId, number>>; reward: number; loss: number };

export default function MissionPage() {
  const { id } = useParams<{ id: string }>();
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
  if (phase.kind === "intro") return <Intro mission={mission} onStart={() => setPhase({ kind: "play", seed: Date.now() })} />;
  if (phase.kind === "play")
    return <Play key={phase.seed} mission={mission} seed={phase.seed} onDone={(r) => setPhase({ kind: "done", ...r })} />;
  return <Done mission={mission} result={phase} onReplay={() => setPhase({ kind: "play", seed: Date.now() })} />;
}

function Intro({ mission, onStart }: { mission: MissionDef; onStart: () => void }) {
  const { state } = useApp();
  const rec = state.missions[mission.id];
  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader back="/missions" />
      <div className="anim-enter flex flex-1 flex-col px-5 pt-4">
        <MissionIcon icon={mission.icon} size={64} />
        <div className="pt-5 text-[13px] font-bold text-brand">Mission · {mission.minutes} min</div>
        <h1 className="pt-1 text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em]">{mission.title}</h1>
        <p className="pt-3 text-[16px] leading-[1.5] text-muted">{mission.blurb}</p>
        <div className="mt-6 flex flex-col gap-3 rounded-[20px] bg-white p-4">
          <div className="text-[13px] font-bold text-muted">You&apos;ll practice</div>
          {mission.skills.map((s) => {
            const sk = SKILLS.find((x) => x.id === s)!;
            return (
              <div key={s} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[14px]">
                  <span className="font-bold">{sk.name}</span>
                  <span className="font-semibold text-muted">{levelOf(state.skills[s])}</span>
                </div>
                <Bar value={state.skills[s]} />
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-[16px] bg-white px-4 py-3">
            <div className="text-[12px] font-semibold text-muted">Clean run</div>
            <div className="text-[17px] font-extrabold text-up">+${mission.reward}</div>
          </div>
          <div className="rounded-[16px] bg-white px-4 py-3">
            <div className="text-[12px] font-semibold text-muted">If you get scammed</div>
            <div className="text-[17px] font-extrabold text-down">{mission.loss ? `−$${mission.loss}` : "Lesson only"}</div>
          </div>
        </div>
        <p className="pt-4 text-[13px] leading-[1.45] text-muted">
          {rec ? `You've played this ${rec.done}×. ` : ""}Every run changes the names, amounts and details, so you can&apos;t just memorize the answers.
        </p>
      </div>
      <div className="sticky bottom-0 bg-bg/90 px-5 pb-[calc(16px+var(--safe-bottom))] pt-3 backdrop-blur">
        <button onClick={onStart} className="btn btn-brand">
          {rec ? "Play a new variation" : "Start mission"}
        </button>
      </div>
    </div>
  );
}

function Play({
  mission,
  seed,
  onDone,
}: {
  mission: MissionDef;
  seed: number;
  onDone: (r: { mistakes: number; deltas: Partial<Record<SkillId, number>>; reward: number; loss: number }) => void;
}) {
  const { state, dispatch } = useApp();
  const steps = useMemo(() => mission.build(seeded(seed)), [mission, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Option | null>(null);
  const [wrong, setWrong] = useState<Option | null>(null);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;

  const choose = (o: Option) => {
    if (picked) return;
    if (o.correct) {
      setPicked(o);
    } else {
      setWrong(o);
      setTried(new Set(tried).add(o.id));
      setMistakes((m) => m + 1);
      if (o.mistake) dispatch({ type: "mistake", mistake: { mission: mission.id, title: o.mistake.title, why: o.mistake.why, at: Date.now() } });
    }
  };

  const next = () => {
    if (!last) {
      setI(i + 1);
      setPicked(null);
      setTried(new Set());
      window.scrollTo({ top: 0 });
      return;
    }
    const clean = mistakes === 0;
    const replay = (state.missions[mission.id]?.done ?? 0) > 0;
    const per = (clean ? 25 : 12) * (replay ? 0.5 : 1);
    const deltas = Object.fromEntries(mission.skills.map((s) => [s, Math.round(per)])) as Partial<Record<SkillId, number>>;
    const reward = clean ? (replay ? Math.round(mission.reward / 2) : mission.reward) : 0;
    const loss = clean ? 0 : mission.loss;
    dispatch({
      type: "mission",
      id: mission.id,
      mistakes,
      reward,
      loss,
      skillDeltas: deltas,
      hype: mission.flag === "hype" ? (clean ? "resisted" : "fell") : undefined,
      phrase: mission.flag === "phrase" ? (clean ? "kept" : "shared") : undefined,
    });
    onDone({ mistakes, deltas, reward, loss });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader
        back="/missions"
        title={mission.title}
        right={<span className="pr-2 text-[13px] font-bold text-muted">{i + 1}/{steps.length}</span>}
      />
      <div className="px-5">
        <div className="flex gap-1.5" aria-hidden>
          {steps.map((s, k) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${k < i || (k === i && picked) ? "bg-brand" : k === i ? "bg-brand/40" : "bg-[#E2E0EA]"}`} />
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
            const cls = isPicked ? "!border-up bg-up-soft" : isTried ? "opacity-45 line-through decoration-down/60" : picked ? "opacity-45" : "";
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                disabled={!!picked || isTried}
                className={`option flex min-h-[58px] items-center justify-between gap-3 px-4 py-3.5 ${cls}`}
              >
                <span className="flex flex-col">
                  <span className={`${o.mono ? "font-mono text-[13px] leading-[1.5] tracking-tight" : "text-[15px]"} font-bold`}>{o.label}</span>
                  {o.detail && <span className="text-[13px] text-muted">{o.detail}</span>}
                </span>
                {isPicked && (
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
      </div>

      {picked && (
        <div className="sticky bottom-0 bg-bg/90 px-5 pb-[calc(16px+var(--safe-bottom))] pt-3 backdrop-blur">
          <button onClick={next} className="btn btn-brand anim-enter">
            {last ? "Finish mission" : "Continue"}
          </button>
        </div>
      )}

      <Sheet open={!!wrong} onClose={() => setWrong(null)} label="What happened">
        {wrong?.mistake && (
          <div className="flex flex-col gap-3 pt-2">
            <Chip tone="bad">Mistake</Chip>
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
              Try that step again
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Done({
  mission,
  result,
  onReplay,
}: {
  mission: MissionDef;
  result: { mistakes: number; deltas: Partial<Record<SkillId, number>>; reward: number; loss: number };
  onReplay: () => void;
}) {
  const { state } = useApp();
  const clean = result.mistakes === 0;
  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader back="/missions" />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
        <div className="flex flex-col items-center rounded-[28px] bg-white px-5 pb-6 pt-7 text-center">
          <div className={`anim-pop flex h-16 w-16 items-center justify-center rounded-full ${clean ? "bg-up" : "bg-brand"}`}>
            {clean ? <CheckIcon size={30} color="#fff" /> : <SparkleIcon size={30} color="#fff" />}
          </div>
          <div className="pt-4 text-[13px] font-bold text-muted">{mission.title}</div>
          <h1 className="pt-1 text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em]">
            {clean ? "Clean run" : `Done, with ${result.mistakes} mistake${result.mistakes === 1 ? "" : "s"}`}
          </h1>
          <p className="pt-2 text-[15px] leading-[1.5] text-muted">
            {clean
              ? "You didn't fall for anything. That's exactly the habit you want before real money is involved."
              : "Better here than with real money. Every mistake you made is one you've now seen up close."}
          </p>
          <div className="mt-4 flex gap-2">
            {result.reward > 0 && <Chip tone="good">+${result.reward} practice money</Chip>}
            {result.loss > 0 && <Chip tone="bad">−${result.loss} lost to the scam</Chip>}
            {result.reward === 0 && result.loss === 0 && <Chip>No reward this run</Chip>}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[20px] bg-white p-4">
          <div className="text-[16px] font-extrabold">Skills practiced</div>
          {mission.skills.map((s) => {
            const sk = SKILLS.find((x) => x.id === s)!;
            return (
              <div key={s} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[14px]">
                  <span className="font-bold">{sk.name}</span>
                  <span className="font-bold text-brand">+{result.deltas[s] ?? 0}</span>
                </div>
                <Bar value={state.skills[s]} />
              </div>
            );
          })}
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
        <Link href="/missions" className="btn btn-brand">
          Back to missions
        </Link>
        <button onClick={onReplay} className="btn btn-ghost">
          Play a new variation
        </button>
      </div>
    </div>
  );
}
