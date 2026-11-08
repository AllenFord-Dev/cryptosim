"use client";

import { useEffect, useState } from "react";

// Appearance: "auto" follows the phone's setting; "light" and "dark" override it. Applied before first paint by the script in layout.
export type ThemeChoice = "auto" | "light" | "dark";
const KEY = "cs-theme";

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  useEffect(() => {
    try {
      setChoice((localStorage.getItem(KEY) as ThemeChoice) || "dark");
    } catch {}
  }, []);
  const set = (c: ThemeChoice) => {
    setChoice(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    apply(c);
  };
  return { choice, set };
}
