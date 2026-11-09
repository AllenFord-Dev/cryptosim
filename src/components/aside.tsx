"use client";

import { useEffect, useState } from "react";
import { go } from "@/lib/nav";
import { useApp } from "@/lib/store";
import { Wordmark } from "./logo";

// Shown beside the phone frame on laptops, so a recruiter knows what they're looking at.
export function DesktopAside() {
  return (
    <aside className="device-aside">
      <Wordmark size={22} />
      <p className="pt-5 text-[17px] leading-[1.5] text-body">A practice wallet for your first crypto purchase. Real prices, practice money.</p>
      <div className="flex flex-col items-start gap-3 pt-6">
        <a
          href="/"
          data-doc=""
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-hover"
        >
          Read the case study
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
        <RestartButton />
      </div>
    </aside>
  );
}

// Lets a reviewer see the app the way a brand-new user does: welcome screen, then the guided first trade.
function RestartButton() {
  const { dispatch } = useApp();
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
        go("/app", "fade");
      }}
      className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-full border border-line bg-card px-4 text-[14px] font-bold text-ink hover:border-brand"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
      {armed ? "Click again to wipe progress" : "Restart as a new user"}
    </button>
  );
}
