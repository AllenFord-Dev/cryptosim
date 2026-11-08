"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { payBackScenario, seeded, short } from "@/lib/missions";

// "Pay a friend back" as a simulated wallet. The screen is a wallet's Send screen; the friend's
// messages arrive as notifications; each decision is a real wallet tap. A wrong tap shows what
// would have happened, inside the wallet, with Buddy naming the trick.

type Mistake = { title: string; why: string };
type Step = "address" | "network" | "review" | "test" | "rest";
type Reveal =
  | { kind: "address"; paid: string; how: "history" | "typed" }
  | { kind: "network"; sentOn: string }
  | { kind: "notest" };

const STEP_NO: Record<Step, number> = { address: 1, network: 2, review: 3, test: 3, rest: 4 };
const L2_FEE = "≈ $0.01";
const ETH_FEE = "≈ $1.80";

export function WalletMission({
  seed,
  prove,
  onMistake,
  onFinish,
}: {
  seed: number;
  prove: boolean;
  onMistake: (m: Mistake) => void;
  onFinish: (mistakes: number, log: { step: string; ok: boolean; note?: string }[], loss: number) => void;
}) {
  const s = useMemo(() => payBackScenario(seeded(seed)), [seed]);
  const [step, setStep] = useState<Step>("address");
  const [to, setTo] = useState<string | null>(null);
  const [net, setNet] = useState("Ethereum");
  const [netMatched, setNetMatched] = useState(false);
  const [sheet, setSheet] = useState<null | "to" | "net" | "review">(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  // First mistake per stage, for the results screen; money "sent" by mistakes, in practice dollars.
  const [notes, setNotes] = useState<Partial<Record<"Address" | "Network" | "Test", string>>>({});
  const [lost, setLost] = useState(0);

  const miss = (r: Reveal, m: Mistake) => {
    const stage = r.kind === "address" ? "Address" : r.kind === "network" ? "Network" : "Test";
    const note = r.kind === "address" ? (r.how === "history" ? "Look-alike from history" : "Typed it wrong") : r.kind === "network" ? `Sent on ${r.sentOn}` : "Skipped the test";
    setNotes((n) => (n[stage] ? n : { ...n, [stage]: note }));
    if (r.kind !== "notest") setLost((x) => x + s.amount);
    setSheet(null);
    setReveal(r);
    setMistakes((n) => n + 1);
    onMistake(m);
  };

  // In prove mode a miss can't be retried: apply the right choice and move on.
  const rewind = () => {
    const r = reveal;
    setReveal(null);
    if (!prove || !r) return;
    if (r.kind === "address") {
      setTo(s.real);
      setStep("network");
    } else if (r.kind === "network") {
      askFriend();
    } else {
      setStep("rest");
      setSent(true);
      setReply("got it, thanks!");
    }
  };

  const pickAddress = (how: "message" | "history" | "typed") => {
    if (how === "message") {
      setTo(s.real);
      setSheet(null);
      setStep("network");
      return;
    }
    if (how === "history")
      miss(
        { kind: "address", paid: s.fakeA, how },
        { title: "Your history can be poisoned", why: "A look-alike address in your recent activity got the money. It matched the first and last characters." },
      );
    else
      miss(
        { kind: "address", paid: s.typo, how },
        { title: "Typed from memory", why: "One wrong character in a typed address sends the money somewhere else." },
      );
  };

  const askFriend = () => {
    setSheet(null);
    setReply(`${s.network}!`);
    setNet(s.network);
    setNetMatched(true);
    setStep("review");
  };

  const pickNetwork = (choice: "default" | "cheap" | "ask") => {
    if (choice === "ask") return askFriend();
    const sentOn = choice === "default" ? "Ethereum" : s.cheap;
    miss(
      { kind: "network", sentOn },
      { title: "Wrong network", why: `${s.friend} uses ${s.network}. Sent on ${sentOn}, the USDC doesn't show up in their wallet.` },
    );
  };

  const send = (test: boolean) => {
    setSheet(null);
    if (!test) {
      miss({ kind: "notest" }, { title: "Skipped the test send", why: "Sending the full amount first means any mistake costs all of it." });
      return;
    }
    setStep("test");
    setSent(true);
    setReply("got the $1 👍");
  };

  if (reveal) return <RevealScreen s={s} reveal={reveal} prove={prove} onRewind={rewind} />;

  const fee = to ? (net === "Ethereum" ? ETH_FEE : L2_FEE) : "—";
  const reviewReady = !!to && netMatched;
  const notif =
    step === "rest" && sent ? (
      <Notif from={s.friend} text={reply ?? ""} />
    ) : reply ? (
      <Notif from={s.friend} text={reply} />
    ) : (
      <Notif from={s.friend} text={`hey! can you send the $${s.amount} for ${s.reason}? usdc pls`} address={s.real} />
    );

  // After the $1 test arrives: send the rest.
  if (step === "test" || step === "rest") {
    const done = step === "rest";
    return (
      <Shell title={`Pay ${s.friend} back`} n={done ? 4 : 3}>
        {notif}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="anim-pop flex h-[72px] w-[72px] items-center justify-center rounded-full bg-good">
            <Check />
          </div>
          <div className="pt-4 text-[30px] font-extrabold tracking-[-0.03em]">{done ? `Sent ${s.amount} USDC` : "Sent 1 USDC"}</div>
          <div className="pt-1 text-[15px] font-semibold text-muted">
            to {short(s.real)} · {s.network}
          </div>
        </div>
        <div className="px-5">
          {done ? (
            <button
              onClick={() =>
                onFinish(
                  mistakes,
                  (["Address", "Network", "Test"] as const).map((st) => ({ step: st, ok: !notes[st], note: notes[st] })),
                  lost,
                )
              }
              className="btn btn-brand"
            >
              Finish
            </button>
          ) : (
            <>
              <p className="pb-4 text-center text-[15px] text-body">The test arrived, so the address and network are right.</p>
              <button
                onClick={() => {
                  setStep("rest");
                  setReply("got it all, thank you!!");
                }}
                className="btn btn-brand"
              >
                Send the other ${s.amount - 1}
              </button>
            </>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={`Pay ${s.friend} back`} n={STEP_NO[step]}>
      {notif}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="tabular text-[64px] font-extrabold leading-none tracking-[-0.045em]">${s.amount}</div>
        <div className="pt-2 text-[15px] font-semibold text-muted">{s.amount} USDC</div>
      </div>
      <div className="px-5">
        <div className="border-t border-line">
          <Row label="To" focus={step === "address"} onClick={() => setSheet("to")}>
            {to ? (
              <span className="text-right">
                <span className="block font-mono text-[15px] font-medium">{short(to)}</span>
                <span className="block text-[13px] font-bold text-good-ink">✓ Matches {s.friend}&apos;s message</span>
              </span>
            ) : (
              <span className="font-semibold text-faint">Add address</span>
            )}
          </Row>
          <Row label="Network" focus={step === "network"} onClick={to ? () => setSheet("net") : undefined}>
            <span className="text-right">
              <span className="block font-bold">{net}</span>
              {netMatched && <span className="block text-[13px] font-bold text-good-ink">✓ {s.friend} uses {s.network}</span>}
            </span>
          </Row>
          <Row label="Network fee">
            <span className="font-bold">{fee}</span>
          </Row>
        </div>
        <p className="min-h-[44px] pt-3 text-[15px] leading-[1.4] text-body">
          {step === "address" && (
            <>
              Tap <b>To</b> to add {s.friend}&apos;s address.
            </>
          )}
          {step === "network" && (
            <>
              {s.friend} never said which network. Tap <b>Network</b>.
            </>
          )}
          {step === "review" && "Everything matches. Review before you send."}
        </p>
        <button disabled={!reviewReady} onClick={() => setSheet("review")} className="btn btn-brand mt-2">
          Review
        </button>
      </div>

      {sheet === "to" && (
        <ActionSheet title={`Add ${s.friend}'s address from`} onCancel={() => setSheet(null)}>
          <SheetOption onClick={() => pickAddress("message")} sub={short(s.real)} mono>
            {s.friend}&apos;s message
          </SheetOption>
          <SheetOption onClick={() => pickAddress("history")} sub={`${short(s.fakeA)} · 2 days ago`} mono>
            Recent activity
          </SheetOption>
          <SheetOption onClick={() => pickAddress("typed")}>Type it in</SheetOption>
        </ActionSheet>
      )}
      {sheet === "net" && (
        <ActionSheet title="Send on which network?" onCancel={() => setSheet(null)}>
          <SheetOption onClick={() => pickNetwork("default")} sub={`Default · fee ${ETH_FEE}`}>
            Ethereum
          </SheetOption>
          <SheetOption onClick={() => pickNetwork("cheap")} sub={`Lowest fee · ${L2_FEE}`}>
            {s.cheap}
          </SheetOption>
          <SheetOption onClick={() => pickNetwork("ask")}>Ask {s.friend} first</SheetOption>
        </ActionSheet>
      )}
      {sheet === "review" && (
        <div className="fixed inset-0 z-50">
          <div className="anim-dim absolute inset-0 bg-[rgba(18,17,26,0.42)]" onClick={() => setSheet(null)} />
          <div className="anim-sheet absolute inset-x-0 bottom-0 mx-auto max-w-[430px] rounded-t-[28px] bg-card px-5 pb-[calc(20px+var(--safe-bottom))] pt-3">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-track" />
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">Review</div>
            <div className="mt-3 border-t border-line">
              <Row label="To">
                <span className="max-w-[230px] text-right font-mono text-[13.5px] font-medium leading-[1.5]">{spaced(s.real)}</span>
              </Row>
              <Row label="Amount">
                <span className="font-bold">{s.amount} USDC</span>
              </Row>
              <Row label="Network">
                <span className="font-bold">{s.network}</span>
              </Row>
              <Row label="Network fee">
                <span className="font-bold">{L2_FEE}</span>
              </Row>
            </div>
            <div className="flex flex-col gap-2.5 pt-5">
              <button onClick={() => send(true)} className="btn btn-brand">
                Send a $1 test first
              </button>
              <button onClick={() => send(false)} className="btn btn-ghost">
                Send ${s.amount}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function RevealScreen({
  s,
  reveal,
  prove,
  onRewind,
}: {
  s: ReturnType<typeof payBackScenario>;
  reveal: Reveal;
  prove: boolean;
  onRewind: () => void;
}) {
  const lost = reveal.kind !== "notest";
  return (
    <Shell title={`Pay ${s.friend} back`}>
      <Notif from={s.friend} text={reveal.kind === "notest" ? "got it, thanks!" : "did you send it? nothing on my end"} />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="tabular text-[52px] font-extrabold leading-none tracking-[-0.045em]">−{s.amount} USDC</div>
        <div className={`pt-2 text-[16px] font-extrabold ${lost ? "text-bad-ink" : "text-muted"}`}>
          {reveal.kind === "address" ? "Sent to the wrong address" : reveal.kind === "network" ? `Sent on the wrong network` : "Sent · it arrived"}
        </div>
      </div>
      <div className="px-5">
        <div className="border-t border-line">
          {reveal.kind === "address" && (
            <>
              <Stack label={`To · not ${s.friend}`} bad>
                <Diff a={reveal.paid} b={s.real} bad />
              </Stack>
              <Stack label={`${s.friend}'s address`}>
                <Diff a={s.real} b={reveal.paid} />
              </Stack>
            </>
          )}
          {reveal.kind === "network" && (
            <>
              <Row label={<span className="font-bold text-bad-ink">Sent on</span>}>
                <span className="font-bold text-bad-ink">{reveal.sentOn}</span>
              </Row>
              <Row label={`${s.friend} uses`}>
                <span className="font-bold">{s.network}</span>
              </Row>
            </>
          )}
          {reveal.kind === "notest" && (
            <Row label="Test send">
              <span className="font-bold">Skipped</span>
            </Row>
          )}
          {lost && (
            <Row label="Undo">
              <span className="font-extrabold text-bad-ink">Not possible</span>
            </Row>
          )}
        </div>
        <Buddy>
          {reveal.kind === "address" && reveal.how === "history" && (
            <>
              <b>That&apos;s address poisoning.</b> A scammer sent you a tiny payment from a look-alike, so it sat in your recent activity. Copy
              addresses from the person, never from your history.
            </>
          )}
          {reveal.kind === "address" && reveal.how === "typed" && (
            <>
              <b>One character was off.</b> Look-alike addresses are built to match what people remember, the start and the end. Always copy
              the whole address from the person.
            </>
          )}
          {reveal.kind === "network" && (
            <>
              <b>Same coin, different network.</b> USDC exists on many networks. {s.friend}&apos;s wallet is watching {s.network}, so money sent
              on {reveal.sentOn} doesn&apos;t show up there. Ask which network before you send.
            </>
          )}
          {reveal.kind === "notest" && (
            <>
              <b>It worked, but you skipped the safety net.</b> A $1 test costs about a cent and catches a wrong address or network before the
              full amount goes out.
            </>
          )}
        </Buddy>
        <button onClick={onRewind} className="btn btn-brand">
          {prove ? "Continue" : "Rewind"}
        </button>
      </div>
    </Shell>
  );
}

function Shell({ title, n, children }: { title: string; n?: number; children: React.ReactNode }) {
  return (
    <div className="anim-enter flex min-h-[var(--app-h)] flex-col bg-card pb-[calc(20px+var(--safe-bottom))] pt-[calc(6px+var(--safe-top))]">
      <div className="flex h-12 items-center justify-between px-3">
        <Link href="/missions" aria-label="Leave mission" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[16px] font-bold">{title}</span>
        <span className="w-11 pr-1 text-right text-[13px] font-bold text-faint">{n ? `${n} of 4` : ""}</span>
      </div>
      {children}
    </div>
  );
}

function Notif({ from, text, address }: { from: string; text: string; address?: string }) {
  return (
    <div key={text} className="notif-in mx-3 mt-1 flex gap-3 rounded-[22px] bg-bg px-3.5 py-3">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#34C759]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.2-2.2c1 .3 2.2.4 3.3.4 5.5 0 10-3.6 10-8.1S17.5 3 12 3z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-[14px]">
          <b>{from}</b>
          <span className="text-[12px] text-muted">now</span>
        </div>
        <p className="text-[15px] leading-[1.3] text-body">{text}</p>
        {address && <p className="pt-0.5 font-mono text-[12.5px] leading-[1.45] text-body">{spaced(address)}</p>}
      </div>
    </div>
  );
}

function Row({ label, focus, onClick, children }: { label: React.ReactNode; focus?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const cls = `flex min-h-[58px] w-full items-center justify-between gap-4 border-b border-line py-3 text-left text-[16px] ${
    focus ? "focus-row -mx-3 w-[calc(100%+24px)] rounded-[14px] border-transparent px-3" : ""
  }`;
  const inner = (
    <>
      <span className="shrink-0 font-semibold text-muted">{label}</span>
      {children}
    </>
  );
  return onClick ? (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Stack({ label, bad, children }: { label: string; bad?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3">
      <span className={`text-[15px] font-semibold ${bad ? "font-bold text-bad-ink" : "text-muted"}`}>{label}</span>
      {children}
    </div>
  );
}

// Shows an address with the characters that differ from `b` highlighted.
function Diff({ a, b, bad }: { a: string; b: string; bad?: boolean }) {
  const groups = spaced(a).split(" ");
  let idx = 0;
  return (
    <span className="font-mono text-[14.5px] font-medium leading-[1.6]">
      {groups.map((g, gi) => (
        <span key={gi}>
          {g.split("").map((ch, ci) => {
            const pos = idx++;
            const differs = a[pos] !== b[pos];
            return differs ? (
              <mark key={ci} className={bad ? "bg-bad-soft text-bad-ink" : "bg-track text-ink"}>
                {ch}
              </mark>
            ) : (
              <span key={ci}>{ch}</span>
            );
          })}
          {gi < groups.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

function Buddy({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-[16px] bg-brand-tint px-3.5 py-3 text-[15px] leading-[1.42] text-body [&_b]:font-extrabold [&_b]:text-ink">
      <div className="flex items-center gap-1.5 pb-1 text-[13px] font-extrabold text-brand">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-brand)" aria-hidden>
          <path d="M12 2l2.2 6.3 6.3 2.2-6.3 2.2L12 19l-2.2-6.3-6.3-2.2 6.3-2.2z" />
        </svg>
        Buddy
      </div>
      {children}
    </div>
  );
}

function ActionSheet({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-dim absolute inset-0 bg-[rgba(18,17,26,0.38)]" onClick={onCancel} />
      <div className="anim-sheet absolute inset-x-0 bottom-0 mx-auto max-w-[430px] px-2.5 pb-[calc(10px+var(--safe-bottom))]">
        <div className="overflow-hidden rounded-[18px] bg-card">
          <div className="border-b border-line px-4 py-3.5 text-center text-[13.5px] font-semibold text-muted">{title}</div>
          {children}
        </div>
        <button onClick={onCancel} className="mt-2 w-full rounded-[18px] bg-card py-4 text-[18px] font-extrabold text-brand-dark">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SheetOption({ onClick, sub, mono, children }: { onClick: () => void; sub?: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="block w-full border-b border-line px-4 py-3.5 text-center last:border-0 active:bg-track">
      <span className="block text-[18px] font-semibold text-brand-dark">{children}</span>
      {sub && <span className={`block pt-0.5 text-[13px] text-muted ${mono ? "font-mono" : ""}`}>{sub}</span>}
    </button>
  );
}

function Check() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

const spaced = (a: string) => `${a.slice(0, 6)} ${a.slice(6).replace(/(.{4})/g, "$1 ").trim()}`;
