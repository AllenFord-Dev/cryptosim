"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, ExternalIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { Chip, SubHeader } from "@/components/ui";
import { readiness } from "@/lib/progress";
import { planLabel } from "@/components/plan-setup";
import { useApp } from "@/lib/store";

const QUESTIONS = [
  {
    q: "A friend asks for 20 USDC \"on Solana.\" Your wallet only has USDC on Base. What do you do?",
    options: [
      { label: "Send it on Base, USDC is USDC", correct: false },
      { label: "Tell them, and agree on a network you both support first", correct: true },
    ],
    why: "The same coin on different networks isn't interchangeable. Agree on the network before anything is sent.",
  },
  {
    q: "An address in your history starts and ends exactly like your roommate's. Do you use it to pay them?",
    options: [
      { label: "No, I ask them for their address again", correct: true },
      { label: "Yes, the start and end match", correct: false },
    ],
    why: "Look-alike addresses are built to match the ends. Always get the address fresh from the person.",
  },
  {
    q: "A livestream of a famous tech CEO says: send any crypto and get double back. Real or scam?",
    options: [
      { label: "Scam", correct: true },
      { label: "Real, it's their official channel", correct: false },
    ],
    why: "Hijacked or fake channels run these constantly, often with deepfaked video. Nobody doubles your money.",
  },
  {
    q: "A site you've never used asks your wallet to approve \"unlimited spending\" of your USDC. What do you do?",
    options: [
      { label: "Reject it", correct: true },
      { label: "Approve, it's needed to use the site", correct: false },
    ],
    why: "Unlimited approvals let a site move your tokens later without asking. Only approve what you understand, for sites you trust.",
  },
  {
    q: "You're about to send $300 to someone for the first time. What's the safest move?",
    options: [
      { label: "Send $1 first and confirm it arrived", correct: true },
      { label: "Send it all at once to save on fees", correct: false },
    ],
    why: "A tiny test send costs cents and catches wrong addresses and wrong networks before they cost you.",
  },
];

const GRAD_STEPS = [
  { id: "install", title: "Install a self-custody wallet", body: "Use a well-known wallet app from your phone's official app store. Check the developer name before installing." },
  { id: "phrase", title: "Write your recovery phrase on paper", body: "Never screenshot it or type it anywhere. This wallet is for testing, but practice the real habit." },
  { id: "network", title: "Switch to a test network", body: "Turn on test networks in settings and choose Base Sepolia. Test coins have no value." },
  { id: "faucet", title: "Get free test ETH from a faucet", body: "A faucet sends free test coins to your address. Copy your address from your wallet's Receive screen.", link: { href: "https://docs.base.org/base-chain/tools/network-faucets", label: "Base test faucets" } },
  { id: "send", title: "Send a tiny amount", body: "Send to a second address you own or a friend's. Get their address fresh, check it in full, and confirm the network." },
];

export default function Ready() {
  const { state, dispatch } = useApp();
  const r = readiness(state);
  const [mode, setMode] = useState<"overview" | "quiz" | "result">("overview");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [tx, setTx] = useState(state.graduation?.tx ?? "");
  const txValid = /^0x[0-9a-fA-F]{64}$/.test(tx.trim());

  if (mode === "quiz") {
    const q = QUESTIONS[qi];
    const last = qi === QUESTIONS.length - 1;
    return (
      <div className="flex min-h-[var(--app-h)] flex-col bg-card">
        <SubHeader back="/ready" title="Readiness check" right={<span className="pr-2 text-[13px] font-bold text-muted">{qi + 1}/{QUESTIONS.length}</span>} />
        <div key={qi} className="anim-enter flex flex-1 flex-col gap-4 px-5 pt-4">
          <h1 className="text-[23px] font-extrabold leading-[1.2] tracking-[-0.02em]">{q.q}</h1>
          <div className="border-t border-line">
            {q.options.map((o, k) => {
              const show = picked !== null;
              const cls = show ? (o.correct ? "text-good-ink" : picked === k ? "text-bad-ink line-through" : "text-faint") : "";
              return (
                <button
                  key={k}
                  disabled={show}
                  onClick={() => {
                    setPicked(k);
                    setAnswers([...answers, o.correct]);
                  }}
                  className={`flex min-h-[58px] w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left text-[16px] font-bold active:bg-bg ${cls}`}
                >
                  {o.label}
                  {show && o.correct ? <span className="text-[18px] font-black">✓</span> : !show && <span className="text-[20px] text-faint">›</span>}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <p className={`anim-enter text-[15px] font-semibold leading-[1.45] ${q.options[picked].correct ? "text-good-ink" : "text-body"}`}>
              {q.options[picked].correct ? "" : "Not quite. "}
              {q.why}
            </p>
          )}
        </div>
        {picked !== null && (
          <div className="sticky bottom-0 bg-card px-5 pb-[calc(16px+var(--safe-bottom))] pt-3">
            <button
              className="btn btn-brand"
              onClick={() => {
                if (last) {
                  const score = answers.filter(Boolean).length;
                  dispatch({ type: "readiness", score, passed: score >= 4 });
                  setMode("result");
                } else {
                  setQi(qi + 1);
                  setPicked(null);
                }
              }}
            >
              {last ? "See result" : "Next"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const passed = state.readiness?.passed;
  const steps = state.graduation?.steps ?? [];
  const graduated = !!state.graduation?.tx;

  return (
    <div className="min-h-[var(--app-h)] bg-card pb-10">
      <SubHeader back="/missions" />
      <div className="flex flex-col gap-3 px-5">
        <div>
          <h1 className="pt-1 text-[32px] font-extrabold leading-[1.1] tracking-[-0.025em]">
            {graduated ? "You did a real send" : passed ? "Ready for one small, real test" : state.plan ? `Ready for your ${planLabel(state.plan)} plan?` : "Ready for a real purchase?"}
          </h1>
          <p className="pt-3 text-[16px] leading-[1.5] text-body">
            {graduated
              ? "You sent a real transaction on a test network and checked it yourself. That's the full loop, with no real money at risk."
              : passed
                ? `You scored ${state.readiness!.score} of ${QUESTIONS.length}. Next, try a real send on a free test network, using everything you practiced.`
                : "This isn't about being good at crypto. It checks that you've rehearsed the moments where people lose money, before you try a real send."}
          </p>
          {mode === "result" && state.readiness && !passed && (
            <p className="pt-3 text-[16px] font-bold leading-[1.45] text-bad-ink">
              Not yet: {state.readiness.score} of {QUESTIONS.length}. You need 4. Replay a mission or two, then try again.
            </p>
          )}
        </div>

        {!passed && (
          <div className="pt-4">
            <h2 className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">Before the check</h2>
            {r.reqs.map((q) => (
              <div key={q.label} className="flex min-h-[54px] items-center gap-3 border-b border-line py-3 first-of-type:border-t">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${q.done ? "bg-up" : "border-[1.5px] border-dashed border-track"}`}>
                  {q.done && <CheckIcon size={13} color="#fff" />}
                </span>
                <span className="flex-1 text-[16px] font-bold">{q.label}</span>
                <span className="text-[14px] font-semibold text-muted">{q.progress}</span>
              </div>
            ))}
            <button
              disabled={!r.unlocked}
              onClick={() => {
                setQi(0);
                setAnswers([]);
                setPicked(null);
                setMode("quiz");
              }}
              className="btn btn-brand mt-5"
            >
              {r.unlocked ? (state.readiness ? "Try the check again" : "Start the readiness check") : "Finish the steps above first"}
            </button>
            {!r.unlocked && (
              <Link href="/missions" className="btn btn-ghost mt-2.5">
                Go to missions
              </Link>
            )}
          </div>
        )}

        {passed && (
          <div className="pt-4">
            <h2 className="pb-1 text-[18px] font-extrabold tracking-[-0.015em]">Your first real send, on a test network</h2>
            <p className="pb-2 text-[13px] leading-[1.45] text-muted">
              Done outside CryptoSim, in a real wallet. Test coins are free and worthless, so mistakes still can&apos;t cost you.
            </p>
            {GRAD_STEPS.map((g, k) => {
              const done = steps.includes(g.id);
              return (
                <div key={g.id} className={`flex gap-3 py-3 ${k ? "border-t border-line" : ""}`}>
                  <button
                    onClick={() => dispatch({ type: "graduation-step", step: g.id, done: !done })}
                    aria-pressed={done}
                    aria-label={`Mark "${g.title}" ${done ? "not done" : "done"}`}
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-up" : "border-[1.5px] border-track"}`}
                  >
                    {done && <CheckIcon size={14} color="#fff" />}
                  </button>
                  <div className="min-w-0">
                    <div className={`text-[15px] font-bold ${done ? "text-muted line-through" : ""}`}>{g.title}</div>
                    <p className="pt-0.5 text-[13px] leading-[1.45] text-muted">{g.body}</p>
                    {g.link && (
                      <a href={g.link.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-[32px] items-center gap-1 text-[13px] font-bold text-brand">
                        {g.link.label} <ExternalIcon size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="border-t border-line pt-3">
              <label className="block">
                <span className="text-[15px] font-bold">Paste your transaction hash</span>
                <span className="block pt-0.5 text-[13px] text-muted">Find it in your wallet&apos;s activity. It starts with 0x and has 66 characters.</span>
                <input
                  value={tx}
                  onChange={(e) => setTx(e.target.value)}
                  placeholder="0x…"
                  spellCheck={false}
                  className="mt-2 h-12 w-full rounded-[14px] border-[1.5px] border-track bg-card px-3 font-mono text-[13px] outline-none focus:border-brand"
                />
              </label>
              {tx && !txValid && <p className="pt-2 text-[13px] font-bold text-down">That doesn&apos;t look like a transaction hash yet.</p>}
              {txValid && (
                <div className="flex flex-col gap-2.5 pt-3">
                  <a
                    href={`https://sepolia.basescan.org/tx/${tx.trim()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost gap-1.5"
                  >
                    Check it on the explorer <ExternalIcon size={16} />
                  </a>
                  {!graduated && (
                    <button onClick={() => dispatch({ type: "graduation-tx", tx: tx.trim() })} className="btn btn-brand">
                      I checked it. Mark my test send done
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {graduated && (
          <div className="mt-2 rounded-[16px] bg-brand-tint px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-brand">
              <SparkleIcon size={16} color="currentColor" /> Buddy
            </div>
            <p className="pt-1 text-[14px] leading-[1.5] text-body">
              Before real money: start small, keep sending tests to new contacts, and come back here whenever something feels off. Your habits
              matter more than any price.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
