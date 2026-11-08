import { MISSIONS, missionById } from "./missions";
import { SKILLS, Skill, SkillId } from "./skills";
import { State, habits } from "./store";
import { marketProgress } from "./market-practice";

export type Step = "learn" | "practice" | "prove" | "done";

export function skillStatus(state: State, skill: Skill) {
  const learned = !!state.lessons[skill.id];
  const practiceIds = skill.practice;
  const practicedIds = practiceIds.filter((id) => (state.missions[id]?.clean ?? 0) > 0);
  const practiced = practicedIds.length > 0;
  const proven = !!state.proven[skill.id];
  const step: Step = !learned ? "learn" : !practiced ? "practice" : !proven ? "prove" : "done";
  const nextPractice = practiceIds.find((id) => !((state.missions[id]?.clean ?? 0) > 0)) ?? practiceIds[0];
  const done = [learned, practiced, proven].filter(Boolean).length;
  return { learned, practiced, proven, step, done, nextPractice, practicedIds };
}

export function stepTarget(skill: Skill, step: Step, nextPractice: string) {
  if (step === "learn") return { href: `/learn/${skill.id}`, title: `Learn: ${skill.name}`, minutes: 1, label: "Learn" };
  if (step === "practice") {
    const m = missionById(nextPractice)!;
    return { href: `/missions/${m.id}`, title: m.title, minutes: m.minutes, label: "Practice" };
  }
  const m = missionById(skill.prove)!;
  return { href: `/missions/${m.id}?mode=prove`, title: `Prove it: ${m.title}`, minutes: m.minutes, label: "Prove" };
}

// The next thing to do: the first skill (in path order) that isn't finished.
export function upNext(state: State) {
  for (const skill of SKILLS) {
    const st = skillStatus(state, skill);
    if (st.step !== "done") return { skill, ...st, target: stepTarget(skill, st.step, st.nextPractice) };
  }
  return null;
}

export const READY_HABITS_MIN = 3;

export function readiness(state: State) {
  const h = habits(state);
  const proven = SKILLS.filter((s) => state.proven[s.id]).length;
  const practiced = SKILLS.filter((s) => skillStatus(state, s).practiced).length;
  const mp = marketProgress(state);
  const reqs = [
    { label: "Practice every skill", done: practiced === SKILLS.length, progress: `${practiced} of ${SKILLS.length}` },
    { label: "Prove every skill", done: proven === SKILLS.length, progress: `${proven} of ${SKILLS.length}` },
    { label: "Finish Market practice", done: mp.done === mp.total, progress: `${mp.done} of ${mp.total}` },
    { label: `Lock in ${READY_HABITS_MIN} safe habits`, done: h.lockedIn >= READY_HABITS_MIN, progress: `${h.lockedIn} of ${READY_HABITS_MIN}` },
  ];
  return { reqs, unlocked: reqs.every((r) => r.done) };
}

export const missionSkill = (missionId: string): SkillId | undefined => MISSIONS.find((m) => m.id === missionId)?.skills[0];

// The single next step across both halves. Market practice is offered whenever it falls behind Safety,
// so the two halves interleave instead of one waiting for the other.
export function nextOverall(state: State) {
  const safety = upNext(state);
  const mp = marketProgress(state);
  const safetySteps = SKILLS.reduce((n, s) => n + skillStatus(state, s).done, 0);
  if (mp.next && (!safety || mp.done * 3 < safetySteps)) return { kind: "market" as const, step: mp.next };
  if (safety) return { kind: "safety" as const, safety };
  return null;
}
