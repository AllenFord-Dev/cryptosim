"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { SKILLS, SkillId, clamp } from "./skills";
import { COINS } from "./coins";

const COIN_NAMES: Record<string, string> = Object.fromEntries(COINS.map((c) => [c.id, c.name]));
// Kept here (not imported from missions) to avoid a circular import.
const MISSION_TITLES: Record<string, string> = {
  "pay-back": "Pay a friend back",
  "hype-pump": "The hype pump",
  "fake-support": "The fake support DM",
  backup: "Back up your wallet",
  receiving: "Get paid for a gig",
  "the-dip": "The dip",
};

export const STARTING_CASH = 1000;
export const FEE_RATE = 0.01;
export const SPREAD_RATE = 0.005;
export const DAILY_REWARD = 5;

export type Trade = {
  id: string;
  coin: string;
  side: "buy" | "sell";
  usd: number;
  qty: number;
  price: number;
  fee: number;
  feeChecked: boolean;
  panic: boolean;
  at: number;
  reason?: TradeReason;
  okLoss?: number;
  auto?: boolean;
};

// Why a trade happened. "hype" (buy) and "panic" (sell) are the red flags.
export type TradeReason = "long" | "curious" | "hype" | "profit" | "changed" | "panic";
export type Plan = { coin: string | null; amount: number };
export type Recurring = { coin: string; amount: number; every: "day" | "week" | "month"; next: number; runs: number };
export type MarketStep = "planned" | "small" | "recurring" | "parked" | "reasoned" | "dip";

export type Mistake = { mission: string; title: string; why: string; at: number };

export type TourStep = "intro" | "coin" | "buy" | "fees" | "confirm" | "send";

export type HabitEvent = { habit: HabitId; ok: boolean; label: string; at: number };

export type State = {
  name: string;
  onboarded: boolean;
  cash: number;
  holdings: Record<string, { qty: number; cost: number; lastBuyAt: number; lastBuyPrice: number }>;
  trades: Trade[];
  skills: Record<SkillId, number>;
  hype: { seen: number; resisted: number };
  phrase: { seen: number; kept: number };
  missions: Record<string, { done: number; clean: number; mistakes: number }>;
  earned: number;
  lost: number;
  lastMistake: Mistake | null;
  daily: { last: string; streak: number; correct: number; seen: number };
  readiness: { passed: boolean; score: number; at: number } | null;
  graduation: { steps: string[]; tx: string; at: number } | null;
  starterDone: boolean;
  tour: TourStep | null;
  log: HabitEvent[];
  lessons: Record<string, boolean>;
  proven: Record<string, boolean>;
  planAsked: boolean;
  plan: Plan | null;
  market: Partial<Record<MarketStep, boolean>>;
  recurring: Recurring | null;
  moments: Record<string, number>;
};

const initialSkills = SKILLS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {} as Record<SkillId, number>);

export const initialState: State = {
  name: "",
  onboarded: false,
  cash: STARTING_CASH,
  holdings: {},
  trades: [],
  skills: initialSkills,
  hype: { seen: 0, resisted: 0 },
  phrase: { seen: 0, kept: 0 },
  missions: {},
  earned: 0,
  lost: 0,
  lastMistake: null,
  daily: { last: "", streak: 0, correct: 0, seen: 0 },
  readiness: null,
  graduation: null,
  starterDone: false,
  tour: null,
  log: [],
  planAsked: false,
  plan: null,
  market: {},
  recurring: null,
  moments: {},
  lessons: {},
  proven: {},
};

export type MissionResult = {
  type: "mission";
  id: string;
  mistakes: number;
  reward: number;
  loss: number;
  skillDeltas: Partial<Record<SkillId, number>>;
  hype?: "resisted" | "fell";
  phrase?: "kept" | "shared";
  prove?: string;
};

type Action =
  | { type: "load"; state: State }
  | { type: "onboard"; name: string }
  | { type: "trade"; coin: string; side: "buy" | "sell"; usd: number; price: number; feeChecked: boolean; reason?: TradeReason; okLoss?: number; auto?: boolean }
  | { type: "plan"; plan: Plan | null }
  | { type: "market"; step: MarketStep }
  | { type: "recurring"; recurring: Recurring | null }
  | { type: "moment"; coin: string; at: number; held: boolean }
  | MissionResult
  | { type: "mistake"; mistake: Mistake }
  | { type: "daily"; date: string; correct: boolean }
  | { type: "readiness"; score: number; passed: boolean }
  | { type: "graduation-step"; step: string; done: boolean }
  | { type: "graduation-tx"; tx: string }
  | { type: "lesson"; skill: string }
  | { type: "starter" }
  | { type: "tour"; step: TourStep | null }
  | { type: "reset" }
  | { type: "restart" };

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load":
      return action.state;
    case "reset":
      return { ...initialState, name: state.name, onboarded: true, starterDone: true };
    case "restart":
      // Wipe everything, including the name, so the app opens like it does for a brand-new user.
      return initialState;
    case "onboard":
      return { ...state, name: action.name.trim().slice(0, 20), onboarded: true, tour: state.starterDone || state.onboarded ? state.tour : "intro" };
    case "trade": {
      const { coin, side, usd, price, feeChecked, reason, okLoss, auto } = action;
      const now = Date.now();
      const holdings = { ...state.holdings };
      const h = holdings[coin] ?? { qty: 0, cost: 0, lastBuyAt: 0, lastBuyPrice: 0 };
      let cash = state.cash;
      let qty = 0;
      let fee = 0;
      let panic = false;
      if (side === "buy") {
        fee = usd * FEE_RATE;
        qty = (usd - fee) / (price * (1 + SPREAD_RATE));
        cash -= usd;
        holdings[coin] = { qty: h.qty + qty, cost: h.cost + usd, lastBuyAt: now, lastBuyPrice: price };
      } else {
        const effPrice = price * (1 - SPREAD_RATE);
        qty = Math.min(h.qty, usd / effPrice);
        const gross = qty * effPrice;
        fee = gross * FEE_RATE;
        cash += gross - fee;
        const share = h.qty > 0 ? qty / h.qty : 1;
        const remainingQty = h.qty - qty;
        // Panic sell: selling at a loss within 15 minutes of buying.
        panic = (now - h.lastBuyAt < 15 * 60 * 1000 && price < h.lastBuyPrice * 0.995) || reason === "panic";
        if (remainingQty * price < 0.01) delete holdings[coin];
        else holdings[coin] = { ...h, qty: remainingQty, cost: h.cost * (1 - share) };
      }
      const trade: Trade = { id: `${now}`, coin, side, usd, qty, price, fee, feeChecked, panic, at: now, reason, okLoss, auto };
      const coinName = COIN_NAMES[coin] ?? coin;
      const events: HabitEvent[] = auto ? [] : [{ habit: "fees", ok: feeChecked, label: `${coinName} ${side}`, at: now }];
      if (side === "sell") events.push({ habit: "calm", ok: !panic, label: `${coinName} sell`, at: now });
      if (side === "buy" && reason) events.push({ habit: "plan", ok: reason !== "hype", label: `${coinName} buy`, at: now });
      const market = { ...state.market };
      if (side === "buy" && reason && reason !== "hype") market.planned = true;
      if (side === "buy" && coin === "usd-coin") market.parked = true;
      if (side === "sell" && reason && reason !== "panic") market.reasoned = true;
      const tradingDelta = feeChecked ? 6 : 1;
      return {
        ...state,
        cash: Math.max(0, cash),
        holdings,
        trades: [trade, ...state.trades].slice(0, 200),
        log: [...events, ...(state.log ?? [])].slice(0, 60),
        market,
        skills: { ...state.skills, trading: clamp(state.skills.trading + tradingDelta - (panic ? 6 : 0)) },
      };
    }
    case "lesson":
      return { ...state, lessons: { ...state.lessons, [action.skill]: true } };
    case "starter":
      return { ...state, starterDone: true, tour: null };
    case "plan":
      return { ...state, planAsked: true, plan: action.plan };
    case "market":
      return state.market?.[action.step] ? state : { ...state, market: { ...state.market, [action.step]: true } };
    case "recurring":
      return { ...state, recurring: action.recurring, market: action.recurring ? { ...state.market, recurring: true } : state.market };
    case "moment": {
      const name = COIN_NAMES[action.coin] ?? action.coin;
      const ev: HabitEvent = { habit: "calm", ok: action.held, label: `${name} dip`, at: Date.now() };
      return {
        ...state,
        moments: { ...state.moments, [action.coin]: action.at },
        market: action.held ? { ...state.market, dip: true } : state.market,
        log: [ev, ...(state.log ?? [])].slice(0, 60),
      };
    }
    case "tour":
      return { ...state, tour: action.step };
    case "mistake":
      return { ...state, lastMistake: action.mistake };
    case "mission": {
      const skills = { ...state.skills };
      for (const [k, d] of Object.entries(action.skillDeltas)) {
        const id = k as SkillId;
        skills[id] = clamp(skills[id] + (d ?? 0));
      }
      const m = state.missions[action.id] ?? { done: 0, clean: 0, mistakes: 0 };
      const clean = action.mistakes === 0;
      const now = Date.now();
      const title = MISSION_TITLES[action.id] ?? "Mission";
      const events: HabitEvent[] = [];
      if (action.hype) events.push({ habit: "hype", ok: action.hype === "resisted", label: title, at: now });
      if (action.phrase) events.push({ habit: "phrase", ok: action.phrase === "kept", label: title, at: now });
      if (action.id === "pay-back") events.push({ habit: "addresses", ok: clean, label: title, at: now });
      return {
        ...state,
        // Practice money only moves with trades and the market; mission results are shown, not paid.
        lost: state.lost + action.loss,
        skills,
        missions: {
          ...state.missions,
          [action.id]: { done: m.done + 1, clean: m.clean + (clean ? 1 : 0), mistakes: m.mistakes + action.mistakes },
        },
        hype: action.hype
          ? { seen: state.hype.seen + 1, resisted: state.hype.resisted + (action.hype === "resisted" ? 1 : 0) }
          : state.hype,
        phrase: action.phrase
          ? { seen: state.phrase.seen + 1, kept: state.phrase.kept + (action.phrase === "kept" ? 1 : 0) }
          : state.phrase,
        proven: action.prove && clean ? { ...state.proven, [action.prove]: true } : state.proven,
        log: [...events, ...(state.log ?? [])].slice(0, 60),
      };
    }
    case "daily": {
      if (state.daily.last === action.date) return state;
      return {
        ...state,
        skills: { ...state.skills, scams: clamp(state.skills.scams + (action.correct ? 3 : 1)) },
        daily: {
          last: action.date,
          streak: state.daily.streak + 1,
          correct: state.daily.correct + (action.correct ? 1 : 0),
          seen: state.daily.seen + 1,
        },
      };
    }
    case "readiness":
      return { ...state, readiness: { passed: action.passed, score: action.score, at: Date.now() } };
    case "graduation-step": {
      const g = state.graduation ?? { steps: [], tx: "", at: 0 };
      const steps = action.done ? Array.from(new Set([...g.steps, action.step])) : g.steps.filter((s) => s !== action.step);
      return { ...state, graduation: { ...g, steps } };
    }
    case "graduation-tx": {
      const g = state.graduation ?? { steps: [], tx: "", at: 0 };
      return { ...state, graduation: { ...g, tx: action.tx, at: Date.now() } };
    }
  }
}

const STORAGE_KEY = "cryptosim-v2";

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action>; ready: boolean } | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "load", state: { ...initialState, ...JSON.parse(raw) } });
    } catch {
      // Storage unavailable: start fresh.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: progress lasts for this visit only.
    }
  }, [state, ready]);

  return <Ctx.Provider value={{ state, dispatch, ready }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export type HabitId = "fees" | "plan" | "hype" | "calm" | "addresses" | "phrase";
export type HabitStatus = "locked-in" | "practicing" | "not-yet";

export type Habit = {
  id: HabitId;
  name: string;
  detail: string;
  status: HabitStatus;
  progress: string;
  how: string;
  action: string;
  href: string;
  recent: boolean[];
};

// Habits are concrete behaviors the user has shown. There is deliberately no overall score:
// the app counts habits locked in and never implies someone is "good at crypto".
export function habits(state: State) {
  // Automatic recurring buys aren't choices, so they don't count toward habits.
  const trades = state.trades.filter((t) => !t.auto);
  const sells = trades.filter((t) => t.side === "sell");
  const pay = state.missions["pay-back"];
  const rate = (good: number, total: number, min: number): HabitStatus =>
    total === 0 ? "not-yet" : total < min ? "practicing" : good / total >= 0.8 ? "locked-in" : "practicing";
  const checked = trades.filter((t) => t.feeChecked).length;
  const calm = sells.filter((t) => !t.panic).length;
  const calmEv = (state.log ?? []).filter((e) => e.habit === "calm").map((e) => e.ok);
  const planned = (state.log ?? []).filter((e) => e.habit === "plan").map((e) => e.ok);
  const recentOf = (id: HabitId) => (state.log ?? []).filter((e) => e.habit === id).slice(0, 5).map((e) => e.ok);

  const list: Habit[] = [
    {
      id: "fees",
      name: "Check fees before buying",
      detail: "Open the fee and spread details before you confirm a trade.",
      status: rate(checked, trades.length, 3),
      progress: trades.length ? `${checked} of ${trades.length} trades checked` : "No trades yet",
      how: "Make 3+ trades and open the fee details on most of them.",
      action: "Make a trade",
      href: "/market",
      recent: trades.slice(0, 5).map((t) => t.feeChecked),
    },
    {
      id: "plan",
      name: "Trade with a plan",
      detail: "Know why you're buying, and how much you could lose and be OK, before you buy.",
      status: rate(planned.filter(Boolean).length, planned.length, 2),
      progress: planned.length ? `${planned.filter(Boolean).length} of ${planned.length} buys planned` : "No planned buys yet",
      how: "Make 2+ buys with a reason that isn't hype.",
      action: "Make a trade",
      href: "/market",
      recent: planned.slice(0, 5),
    },
    {
      id: "hype",
      name: "Ignore hype posts",
      detail: "Don't buy a coin because a post or a stranger pushed it.",
      status: rate(state.hype.resisted, state.hype.seen, 1),
      progress: state.hype.seen ? `${state.hype.resisted} of ${state.hype.seen} resisted` : "Not practiced yet",
      how: "Play the Hype pump mission without buying in.",
      action: "Try the mission",
      href: "/missions/hype-pump",
      recent: recentOf("hype"),
    },
    {
      id: "calm",
      name: "Don't panic-sell",
      detail: "Avoid selling at a loss right after you bought.",
      status: calmEv.length ? rate(calmEv.filter(Boolean).length, calmEv.length, 2) : rate(calm, sells.length, 2),
      progress: calmEv.length ? `${calmEv.filter(Boolean).length} of ${calmEv.length} calm` : sells.length ? `${calm} of ${sells.length} sells calm` : "No sells or dips yet",
      how: "Sell with a reason, and hold through real dips instead of dumping.",
      action: "Sell a coin",
      href: "/market",
      recent: recentOf("calm"),
    },
    {
      id: "addresses",
      name: "Use the address you were sent",
      detail: "Never copy an address from your history.",
      status: pay ? rate(pay.clean, pay.done, 1) : "not-yet",
      progress: pay ? `${pay.clean} of ${pay.done} sends clean` : "Not practiced yet",
      how: "Finish Pay a friend back without a mistake.",
      action: "Try the mission",
      href: "/missions/pay-back",
      recent: recentOf("addresses"),
    },
    {
      id: "phrase",
      name: "Never share your recovery phrase",
      detail: "Not with support, not with a website, not with an AI chat.",
      status: rate(state.phrase.kept, state.phrase.seen, 1),
      progress: state.phrase.seen ? `${state.phrase.kept} of ${state.phrase.seen} kept private` : "Not practiced yet",
      how: "Play The fake support DM and keep your phrase to yourself.",
      action: "Try the mission",
      href: "/missions/fake-support",
      recent: recentOf("phrase"),
    },
  ];
  const lockedIn = list.filter((h) => h.status === "locked-in").length;
  return { list, lockedIn, total: list.length };
}
