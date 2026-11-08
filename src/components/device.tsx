"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// On a laptop, the app runs inside a realistic iPhone frame. On a phone, every wrapper here is
// `display: contents`, so the app is simply full-screen.
export function Device({ children }: { children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="device">
      <div className="device-btn device-btn-action" aria-hidden />
      <div className="device-btn device-btn-up" aria-hidden />
      <div className="device-btn device-btn-down" aria-hidden />
      <div className="device-btn device-btn-power" aria-hidden />
      <div className="device-screen">
        <div className="device-status" aria-hidden>
          <span>9:41</span>
          <span className="flex items-center gap-[6px]">
            <svg width="18" height="12" viewBox="0 0 18 12">
              <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
              <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
              <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
            <svg width="17" height="12" viewBox="0 0 17 12">
              <path d="M1.6 4.6a9.8 9.8 0 0 1 13.8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4.4 7.4a5.8 5.8 0 0 1 8.2 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8.5" cy="10.3" r="1.5" fill="currentColor" />
            </svg>
            <svg width="27" height="13" viewBox="0 0 27 13">
              <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" strokeOpacity="0.4" />
              <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" />
              <path d="M25 4.5v4a2 2 0 0 0 0-4z" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </span>
        </div>
        <div className="device-island" aria-hidden />
        <div ref={scroller} className="app-scroll">
          {children}
        </div>
        <div className="device-home" aria-hidden />
      </div>
    </div>
  );
}
