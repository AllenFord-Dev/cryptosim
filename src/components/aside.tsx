"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Wordmark } from "./logo";

// Shown beside the phone frame on laptops, so a recruiter knows what they're looking at.
export function DesktopAside() {
  return (
    <aside className="device-aside">
      <Wordmark size={22} />
      <h2 className="pt-6 text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
        Learn crypto before it costs you.
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
      <RestartButton />
    </aside>
  );
}

// Lets a reviewer see the app the way a brand-new user does: welcome screen, then the guided first trade.
function RestartButton() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        dispatch({ type: "restart" });
        router.push("/");
      }}
      className="mt-5 inline-flex min-h-[40px] items-center gap-2 self-start rounded-full border border-line bg-card px-4 text-[14px] font-bold text-ink hover:border-brand"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
      {armed ? "Click again to wipe progress" : "Restart as a new user"}
    </button>
  );
}
