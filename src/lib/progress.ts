import { MISSIONS, MissionDef } from "./missions";
import { SKILLS } from "./skills";
import { State, habits } from "./store";

// The mission that practices the user's weakest skill, preferring ones not yet done cleanly.
export function upNext(state: State): { mission: MissionDef; reason: string } | null {
  const notClean = MISSIONS.filter((m) => !(state.missions[m.id]?.clean > 0));
  if (notClean.length === 0) return null;
  const ranked = [...notClean].sort((a, b) => {
    const sa = Math.min(...a.skills.map((s) => state.skills[s]));
    const sb = Math.min(...b.skills.map((s) => state.skills[s]));
    return sa - sb;
  });
  const m = ranked[0];
  const tried = state.missions[m.id]?.done > 0;
  return { mission: m, reason: tried ? "Try again · your weak spot" : Object.keys(state.missions).length ? "Up next · your weak spot" : "Start here" };
}

export const READY_SKILL_MIN = 35;
export const READY_HABITS_MIN = 3;

export function readiness(state: State) {
  const h = habits(state);
  const missionsDone = MISSIONS.filter((m) => state.missions[m.id]?.done > 0).length;
  const skillsReady = SKILLS.filter((s) => state.skills[s.id] >= READY_SKILL_MIN).length;
  const reqs = [
    { label: "Play every mission once", done: missionsDone === MISSIONS.length, progress: `${missionsDone} of ${MISSIONS.length}` },
    { label: "Practice every skill", done: skillsReady === SKILLS.length, progress: `${skillsReady} of ${SKILLS.length}` },
    { label: `Lock in ${READY_HABITS_MIN} safe habits`, done: h.lockedIn >= READY_HABITS_MIN, progress: `${h.lockedIn} of ${READY_HABITS_MIN}` },
  ];
  return { reqs, unlocked: reqs.every((r) => r.done) };
}
