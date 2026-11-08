// Shown beside the phone frame on laptops, so a recruiter knows what they're looking at.
export function DesktopAside() {
  return (
    <aside className="device-aside">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[linear-gradient(150deg,#7B4DFF_0%,#5521F5_50%,#2F0FA6_100%)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          </svg>
        </span>
        <span className="text-[18px] font-extrabold tracking-[-0.02em]">CryptoSim</span>
      </div>
      <h2 className="pt-6 text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
        Make your first crypto mistakes with fake money.
      </h2>
      <p className="pt-4 text-[16px] leading-[1.55] text-muted">
        A practice wallet and market for first-timers. Real prices, practice money, and missions that recreate the scams and slip-ups
        that cost real people real money.
      </p>
      <div className="flex flex-col gap-2.5 pt-6 text-[14px] font-semibold text-body">
        <span>→ Try a mission: Missions tab</span>
        <span>→ Buy a coin: Market tab</span>
        <span>→ Ask a question: the sparkle button</span>
      </div>
      <p className="pt-6 text-[13px] leading-[1.5] text-faint">
        Practice money only. Nothing can be deposited, withdrawn or lost. Designed and built by Allen Ford.
      </p>
    </aside>
  );
}
