import type { LessonCard } from "@/lib/skills";
import { CheckIcon } from "./icons";

// Small, concrete illustrations for lesson cards, drawn from the real interface moment they teach.
export function LessonVisual({ kind }: { kind?: LessonCard["visual"] }) {
  const box = "flex min-h-[200px] flex-col justify-center gap-2.5 rounded-[24px] bg-brand-tint p-5";
  switch (kind) {
    case "phrase":
      return (
        <div className={box}>
          <div className="grid grid-cols-3 gap-1.5">
            {["maple", "orbit", "candle", "river", "frost", "tiger", "velvet", "harbor", "pixel", "meadow", "lantern", "cobalt"].map((w, k) => (
              <span key={w} className="flex h-8 items-center gap-1.5 rounded-[10px] bg-card px-2 text-[12px] font-bold">
                <span className="text-[10px] text-faint">{k + 1}</span>
                {w}
              </span>
            ))}
          </div>
          <span className="text-[12px] font-bold text-brand">12 words = full control of the wallet</span>
        </div>
      );
    case "address":
      return (
        <div className={box}>
          <Addr label="From Maya, just now" a="0x7a3f" m="9e21c4b08d55f310" z="51d8" ok />
          <Addr label="In your history" a="0x7a3f" m="1b0e77d2a9c46e05" z="51d8" />
          <span className="text-[12px] font-bold text-brand">Same start, same end, different middle</span>
        </div>
      );
    case "network":
      return (
        <div className={box}>
          {[
            ["Base", true],
            ["Ethereum", false],
            ["Solana", false],
          ].map(([n, ok]) => (
            <div key={n as string} className={`flex items-center justify-between rounded-[14px] bg-card px-4 py-3 text-[14px] font-bold ${ok ? "ring-2 ring-up" : "opacity-60"}`}>
              USDC on {n as string}
              {ok ? <CheckIcon size={16} color="var(--color-up)" /> : <span className="text-[12px] text-down">may never arrive</span>}
            </div>
          ))}
        </div>
      );
    case "test":
      return (
        <div className={box}>
          <Row l="1. Send a test" r="$1.00" />
          <Row l="2. Ask: did it arrive?" r="Yes ✓" good />
          <Row l="3. Send the rest" r="$39.00" />
        </div>
      );
    case "receive":
      return (
        <div className={box}>
          <div className="rounded-[16px] bg-card p-4">
            <div className="text-[12px] font-bold text-muted">Send this to the payer</div>
            <div className="pt-1 font-mono text-[13px] font-bold">0x4c1e 88a0 … 9f2b</div>
            <div className="pt-1 text-[14px] font-extrabold text-brand">USDC on Base</div>
          </div>
        </div>
      );
    case "pending":
      return (
        <div className={box}>
          <Row l="Pending" r="Can still fail" />
          <Row l="Confirmed" r="Final ✓" good />
        </div>
      );
    case "urgency":
      return (
        <div className={box}>
          {["Last chance!", "Only 30 minutes left", "Before it's too late"].map((t) => (
            <span key={t} className="self-start rounded-full bg-card px-3.5 py-2 text-[14px] font-bold text-down">
              {t}
            </span>
          ))}
        </div>
      );
    case "dm":
      return (
        <div className={box}>
          <div className="self-start rounded-[18px] rounded-bl-[6px] bg-card px-4 py-3 text-[14px]">
            <div className="text-[12px] font-bold">Wallet Support ✓</div>
            Please verify your 12-word phrase to keep your funds safe.
          </div>
          <span className="self-start rounded-full bg-down-soft px-3 py-1.5 text-[12px] font-bold text-down">Real support never asks this</span>
        </div>
      );
    case "returns":
      return (
        <div className={box}>
          {["2% daily, guaranteed", "Double your crypto", "Risk-free returns"].map((t) => (
            <span key={t} className="self-start rounded-full bg-card px-3.5 py-2 text-[14px] font-bold line-through decoration-down decoration-2">
              {t}
            </span>
          ))}
        </div>
      );
    case "swing":
      return (
        <div className={box}>
          <svg viewBox="0 0 300 100" className="w-full" aria-hidden>
            <path d="M0 60 L25 52 L50 64 L75 40 L100 48 L125 30 L150 55 L175 45 L200 70 L225 50 L250 58 L275 35 L300 42" fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] font-bold text-brand">A normal week for many coins</span>
        </div>
      );
    case "fees":
      return (
        <div className={box}>
          <Row l="You pay" r="$100.00" />
          <Row l="Fee + spread" r="−$1.50" bad />
          <Row l="You get" r="$98.50 of crypto" />
        </div>
      );
    case "panic":
      return (
        <div className={box}>
          <Row l="Bought at" r="$100" />
          <Row l="Dipped to" r="$92" bad />
          <Row l="Sell now?" r="Locks in −$8 + fees" bad />
        </div>
      );
    case "final":
      return (
        <div className={box}>
          <div className="rounded-[16px] bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold">Sent 40 USDC</span>
              <span className="rounded-full bg-up-soft px-2.5 py-1 text-[12px] font-bold text-up">Confirmed</span>
            </div>
            <div className="pt-1 text-[12px] text-muted">To 0x7a3f…51d8 · Base</div>
          </div>
          <div className="flex items-center justify-between rounded-[14px] bg-card/70 px-4 py-3 text-[14px] font-bold text-faint">
            Undo transfer <span className="text-[12px]">Not possible</span>
          </div>
        </div>
      );
    default:
      return (
        <div className={box}>
          <Row l="Practice money" r="$1,000" />
          <Row l="Real money at risk" r="$0" good />
        </div>
      );
  }
}

function Addr({ label, a, m, z, ok }: { label: string; a: string; m: string; z: string; ok?: boolean }) {
  return (
    <div className={`rounded-[14px] bg-card px-4 py-3 ${ok ? "ring-2 ring-up" : ""}`}>
      <div className="text-[11px] font-bold text-muted">{label}</div>
      <div className="font-mono text-[13px] font-bold">
        {a}
        <span className={ok ? "text-up" : "text-down"}>{m}</span>
        {z}
      </div>
    </div>
  );
}

function Row({ l, r, good, bad }: { l: string; r: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-card px-4 py-3 text-[14px]">
      <span className="font-semibold text-muted">{l}</span>
      <span className={`font-extrabold ${good ? "text-up" : bad ? "text-down" : ""}`}>{r}</span>
    </div>
  );
}
