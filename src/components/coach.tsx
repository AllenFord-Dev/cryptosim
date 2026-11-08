"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Box = { x: number; y: number; w: number; h: number };

// One tip at a time, pointing at the real control. Everything outside the highlighted control is
// dimmed and blocked, so the next step is always obvious.
export function Coach({ target, title, body, step, total, radius = 20 }: { target: string; title: string; body: string; step: number; total: number; radius?: number }) {
  const [box, setBox] = useState<Box | null>(null);
  const [view, setView] = useState({ w: 390, h: 844 });

  useEffect(() => {
    let first = true;
    const measure = () => {
      const el = document.querySelector(`[data-coach="${target}"]`) as HTMLElement | null;
      if (!el) return setBox(null);
      if (first) {
        el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
        first = false;
      }
      const screen = document.querySelector(".device-screen") as HTMLElement | null;
      const framed = screen && getComputedStyle(screen).display === "block";
      const base = framed ? screen!.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const scale = framed ? base.width / 390 : 1;
      const r = el.getBoundingClientRect();
      setView({ w: base.width / scale, h: base.height / scale });
      setBox({ x: (r.left - base.left) / scale - 6, y: (r.top - base.top) / scale - 6, w: r.width / scale + 12, h: r.height / scale + 12 });
    };
    const t = setTimeout(measure, 350);
    const id = setInterval(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [target]);

  if (!box) return null;
  const below = box.y + box.h + 170 < view.h;
  const cx = box.x + box.w / 2;
  const tipLeft = Math.min(Math.max(16, cx - 145), view.w - 16 - 290);
  const arrowLeft = Math.min(Math.max(18, cx - tipLeft - 7), 290 - 32);
  const shade = "fixed z-[70] bg-[rgba(18,17,26,0.5)] anim-dim";
  // Portal out of any sheet so "fixed" is relative to the screen, not a transformed parent.
  const host = document.querySelector(".app-scroll") ?? document.body;
  return createPortal(
    <>
      {/* Four panels around the highlighted control block every other tap. */}
      <div className={shade} style={{ left: 0, top: 0, width: "100%", height: Math.max(0, box.y) }} />
      <div className={shade} style={{ left: 0, top: box.y + box.h, width: "100%", bottom: 0 }} />
      <div className={shade} style={{ left: 0, top: box.y, width: Math.max(0, box.x), height: box.h }} />
      <div className={shade} style={{ left: box.x + box.w, top: box.y, right: 0, height: box.h }} />
      <div
        className="coach-ring pointer-events-none fixed z-[71]"
        style={{ left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius }}
        aria-hidden
      />
      <div
        role="status"
        className="anim-enter fixed z-[72] w-[290px] rounded-[18px] bg-[#16151E] px-4 pb-4 pt-3.5 text-white shadow-[0_20px_44px_-14px_rgba(0,0,0,0.6)]"
        style={{ left: tipLeft, ...(below ? { top: box.y + box.h + 14 } : { bottom: view.h - box.y + 14 }) }}
      >
        <span
          aria-hidden
          className="absolute h-3.5 w-3.5 rotate-45 rounded-[3px] bg-[#16151E]"
          style={{ left: arrowLeft, ...(below ? { top: -6 } : { bottom: -6 }) }}
        />
        <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }, (_, k) => (
            <span key={k} className={`h-1 rounded-full ${k < step ? "w-5 bg-white" : "w-2.5 bg-white/25"}`} />
          ))}
        </div>
        <div className="pt-2.5 text-[16px] font-bold leading-tight tracking-[-0.01em]">{title}</div>
        <p className="pt-1 text-[14px] leading-[1.45] text-white/70">{body}</p>
      </div>
    </>,
    host,
  );
}
