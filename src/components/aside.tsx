// Shown beside the app on wide screens, so a recruiter opening the link on a laptop knows what they're looking at.
export function DesktopAside() {
  return (
    <aside className="fixed left-[max(24px,calc(50%-215px-380px))] top-1/2 hidden w-[320px] -translate-y-1/2 flex-col gap-4 xl:flex">
      <div className="text-[13px] font-bold text-brand">A product case study</div>
      <h2 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
        CryptoSim: make your first crypto mistakes with fake money.
      </h2>
      <p className="text-[15px] leading-[1.55] text-muted">
        A practice wallet and market for first-timers aged 18–25. Real prices, practice money, and missions that recreate the scams
        and slip-ups that cost real people real money.
      </p>
      <p className="text-[13px] leading-[1.5] text-faint">
        Best on a phone. Everything here is practice money: nothing can be deposited, withdrawn or lost.
      </p>
    </aside>
  );
}
