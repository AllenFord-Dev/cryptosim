"use client";

import { useEffect, useState } from "react";
import { go } from "@/lib/nav";
import { useApp } from "@/lib/store";
import { Wordmark } from "./logo";
import { useTheme } from "@/lib/theme";

// Shown beside the phone frame on laptops, so a recruiter knows what they're looking at.
export function DesktopAside() {
  return (
    <aside className="device-aside">
      <Wordmark size={22} />
      <p className="pt-5 text-[17px] leading-[1.5] text-body">A practice wallet for your first crypto purchase. Real prices, practice money.</p>
      <div className="grid w-fit gap-3 pt-6">
        <a
          href="/"
          data-doc=""
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-hover"
        >
          Read the case study
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
        <RestartButton />
      </div>
      <ThemeSwitch />
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
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-[14px] font-bold text-ink hover:border-brand"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
      {armed ? "Click again to wipe progress" : "Restart as a new user"}
    </button>
  );
}

// Light or dark, so a reviewer can see both without opening the app's menu.
function ThemeSwitch() {
  const { set } = useTheme();
  const [mode, setMode] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const read = () => setMode(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    const o = new MutationObserver(read);
    o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => o.disconnect();
  }, []);
  return (
    <div role="radiogroup" aria-label="Appearance" className="mt-6 inline-grid grid-cols-2 gap-1 rounded-full border border-line bg-card p-1">
      {(["light", "dark"] as const).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => set(m)}
          className={`min-h-[34px] rounded-full px-4 text-[13px] font-bold capitalize ${mode === m ? "bg-brand text-white" : "text-muted hover:text-ink"}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
