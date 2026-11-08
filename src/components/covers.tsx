import { MissionDef } from "@/lib/missions";
import { ChatIcon, CheckIcon, InboxIcon, KeyIcon, MarketIcon, MegaphoneIcon, SendIcon } from "./icons";

// Each mission gets its own small scene, drawn from the scenario itself.
export const COVER: Record<string, { bg: string; ink: string }> = {
  "pay-back": { bg: "#E7F0FF", ink: "#1F4FD1" },
  "hype-pump": { bg: "#FFEEDF", ink: "#B4500E" },
  "fake-support": { bg: "#FCE9EC", ink: "#B4233C" },
  backup: { bg: "#E6F5EC", ink: "#11734A" },
  receiving: { bg: "#FFF5D6", ink: "#8A6100" },
  "the-dip": { bg: "#E6F4EF", ink: "#0F6B47" },
};

export function MissionThumb({ mission, size = 52 }: { mission: MissionDef; size?: number }) {
  const t = COVER[mission.id] ?? { bg: "#F1ECFF", ink: "#5521F5" };
  const I = { send: SendIcon, megaphone: MegaphoneIcon, chat: ChatIcon, key: KeyIcon, inbox: InboxIcon, chart: MarketIcon }[mission.icon];
  return (
    <div className="flex shrink-0 items-center justify-center rounded-[16px]" style={{ width: size, height: size, background: t.bg }} aria-hidden>
      <I size={Math.round(size * 0.46)} color={t.ink} />
    </div>
  );
}

export function MissionCover({ id }: { id: string }) {
  const t = COVER[id] ?? { bg: "#F1ECFF", ink: "#5521F5" };
  return (
    <div className="relative h-[156px] overflow-hidden" style={{ background: t.bg }} aria-hidden>
      {id === "pay-back" && (
        <div className="absolute inset-x-5 top-5 flex flex-col gap-1.5">
          <Bubble>hey! can you send the $40 for dinner?</Bubble>
          <Bubble mono>0x7a3f 9e21 c4b0 … 51d8</Bubble>
          <div className="mt-1 flex items-center gap-1.5 self-end rounded-full bg-card px-3 py-1.5 text-[11px] font-bold shadow-sm" style={{ color: t.ink }}>
            Which address is really hers?
          </div>
        </div>
      )}
      {id === "hype-pump" && (
        <div className="absolute inset-x-6 top-5 rounded-[16px] bg-card p-3 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full" style={{ background: t.bg }} />
            <span className="text-[11px] font-bold">@100xcalls</span>
            <span className="text-[11px] text-muted">· 12m</span>
          </div>
          <p className="pt-1.5 text-[12px] font-semibold leading-[1.35]">$MOONCAT is up 612% this week. Last chance before tonight!</p>
          <svg viewBox="0 0 200 34" className="mt-1.5 h-[30px] w-full" aria-hidden>
            <path d="M0 30 L30 28 L60 25 L90 20 L115 12 L130 3 L142 8 L152 22 L170 29 L200 31" fill="none" stroke="var(--color-down)" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {id === "fake-support" && (
        <div className="absolute inset-x-6 top-5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 pb-0.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-[11px] font-extrabold" style={{ color: t.ink }}>
              W
            </span>
            <span className="text-[12px] font-bold">Wallet Support</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1D9BF0]">
              <CheckIcon size={9} color="#fff" />
            </span>
          </div>
          <Bubble>We detected suspicious activity. Verify your wallet within 30 minutes.</Bubble>
          <div className="self-start rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: t.ink }}>
            Enter your 12 words →
          </div>
        </div>
      )}
      {id === "backup" && (
        <div className="absolute inset-x-6 top-5 grid grid-cols-3 gap-1.5">
          {["maple", "orbit", "candle", "•••••", "frost", "•••••", "velvet", "harbor", "•••••"].map((w, i) => (
            <span key={i} className="flex h-8 items-center gap-1.5 rounded-[10px] bg-card px-2 text-[11px] font-bold">
              <span className="text-[10px] text-faint">{i + 1}</span>
              <span className={w.startsWith("•") ? "tracking-widest text-faint" : ""}>{w}</span>
            </span>
          ))}
          <span className="col-span-3 pt-1 text-[11px] font-bold" style={{ color: t.ink }}>
            Screenshot, notes app, or paper?
          </span>
        </div>
      )}
      {id === "the-dip" && (
        <div className="absolute inset-x-6 top-5 rounded-[16px] bg-card p-3 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold">Your Bitcoin</span>
            <span className="rounded-full bg-down-soft px-2 py-0.5 text-[11px] font-bold text-down">−8% today</span>
          </div>
          <svg viewBox="0 0 200 40" className="mt-1.5 h-[36px] w-full" aria-hidden>
            <path d="M0 10 L20 12 L40 8 L60 14 L80 11 L100 18 L120 16 L140 26 L160 24 L180 31 L200 30" fill="none" stroke="var(--color-down)" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
          <div className="pt-1 text-[11px] font-bold" style={{ color: t.ink }}>
            Sell now, or stick to the plan?
          </div>
        </div>
      )}
      {id === "receiving" && (
        <div className="absolute inset-x-6 top-5 flex gap-2.5">
          <div className="flex-1 rounded-[16px] bg-card p-3 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]">
            <div className="text-[10px] font-bold text-muted">Their screenshot</div>
            <div className="pt-1 text-[13px] font-extrabold">Payment complete</div>
            <div className="text-[11px] text-muted">80 USDC</div>
          </div>
          <div className="flex-1 rounded-[16px] bg-card p-3 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]">
            <div className="text-[10px] font-bold text-muted">Your wallet</div>
            <div className="pt-1 text-[13px] font-extrabold text-down">0.00 USDC</div>
            <div className="text-[11px] text-muted">Nothing arrived</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <div className={`max-w-[88%] self-start rounded-[16px] rounded-bl-[5px] bg-card px-3 py-2 text-[12px] leading-[1.35] shadow-sm ${mono ? "font-mono text-[11px]" : "font-semibold"}`}>
      {children}
    </div>
  );
}
