import { useEffect, useRef, useState } from "react";

// Keeps a sheet or drawer on screen while it animates closed, and remembers what it last showed
// so the content doesn't empty out mid-animation.
export function usePresence<T>(open: boolean, content: T, ms = 260) {
  const [mounted, setMounted] = useState(open);
  const last = useRef(content);
  if (open) last.current = content;

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);

  return { mounted: open || mounted, closing: !open && mounted, content: last.current };
}

// Focuses a field once it mounts, without letting the browser scroll anything to reach it. Plain
// autoFocus on a screen that's still sliding in makes the browser shift the whole phone sideways.
const focusers = new Map<number, (el: HTMLElement | null) => void>();
export function focusOnMount(delay = 0) {
  let f = focusers.get(delay);
  if (!f) {
    f = (el) => {
      if (el) setTimeout(() => el.isConnected && el.focus({ preventScroll: true }), delay);
    };
    focusers.set(delay, f);
  }
  return f;
}
