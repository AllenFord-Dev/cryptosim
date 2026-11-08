"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { NavDir, navDirection, setNavImpl } from "@/lib/nav";

// Catches in-app link taps and router navigations and runs them as View Transitions (see lib/nav).
// A link can force a direction with data-nav="back" (used by back buttons).
export function NavMotion() {
  const router = useRouter();
  const pathname = usePathname();
  const arrived = useRef<(() => void) | null>(null);

  // The new page has rendered: let the transition capture it.
  useEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const run = (href: string, dir?: NavDir) => {
      const url = new URL(href, window.location.href);
      const target = url.pathname + url.search + url.hash;
      const from = window.location.pathname;
      const canAnimate =
        typeof document.startViewTransition === "function" &&
        url.pathname !== from &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !html.dataset.nav;
      if (!canAnimate) {
        router.push(target);
        return;
      }
      html.dataset.nav = dir ?? navDirection(from, url.pathname);
      const t = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const done = () => {
              clearTimeout(timer);
              resolve();
            };
            // Never hold the screen for long if a page is slow to arrive.
            const timer = setTimeout(done, 1200);
            arrived.current = done;
            router.push(target);
          }),
      );
      t.finished.finally(() => delete html.dataset.nav);
    };
    setNavImpl(run);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      // Stops next/link's own navigation; the link's onClick still runs.
      e.preventDefault();
      run(a.href, (a.dataset.nav as NavDir | undefined) || undefined);
    };
    document.addEventListener("click", onClick, true);
    // Lets iOS Safari show :active press states.
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("touchstart", noop);
      setNavImpl(null);
    };
  }, [router]);

  return null;
}
