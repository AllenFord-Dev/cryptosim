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
