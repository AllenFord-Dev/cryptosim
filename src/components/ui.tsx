"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { coinById } from "@/lib/coins";
import { BackIcon, CloseIcon } from "./icons";

export function CoinMark({ id, size = 36 }: { id: string; size?: number }) {
  const c = coinById(id);
  if (!c) return null;
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold"
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: size * 0.42 }}
    >
      {c.mark}
    </div>
  );
}

function path(values: number[], w: number, h: number, pad = 2) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = max === min ? h / 2 : pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function Spark({ values, w = 52, h = 22 }: { values: number[]; w?: number; h?: number }) {
  const flat = values.length < 2 || Math.max(...values) - Math.min(...values) < values[0] * 0.002;
  const up = values[values.length - 1] >= values[0];
  const color = flat ? "#A3A0AE" : up ? "var(--color-up)" : "var(--color-down)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <path d={flat ? `M0 ${h / 2} L${w} ${h / 2}` : path(values, w, h)} fill="none" stroke={color} strokeWidth={1.8} />
    </svg>
  );
}

// Smooth through midpoints (keeps the real price texture, softens harsh corners).
function curvePoints(values: number[], w: number, h: number, padTop: number, padBottom: number) {
  const n = values.length;
  // Light 3-point smoothing so spikes don't look jagged at phone size.
  const sm = values.map((_, i) => {
    const a = values.slice(Math.max(0, i - 1), i + 2);
    return a.reduce((s, v) => s + v, 0) / a.length;
  });
  const min = Math.min(...sm);
  const max = Math.max(...sm);
  const span = max - min || 1;
  return sm.map((v, i) => [(i / (n - 1)) * w, padTop + (1 - (v - min) / span) * (h - padTop - padBottom)] as const);
}

export function AreaChart({ values, height = 112, color = "#5521F5" }: { values: number[]; height?: number; color?: string }) {
  const id = useId().replace(/:/g, "");
  const w = 390;
  if (values.length >= 2) {
    const inset = 12; // room for the end dot
    const pts = curvePoints(values, w - inset, height, 12, 14);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      d += i < pts.length - 1 ? ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}` : ` L${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    const [ex, ey] = pts[pts.length - 1];
    const base = pts[0][1];
    return (
      <div className="relative" style={{ height }}>
        <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden className="block overflow-visible">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.2} />
              <stop offset="0.7" stopColor={color} stopOpacity={0.04} />
              <stop offset="1" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`M0 ${base} L${w} ${base}`} stroke="#C9C6D4" strokeWidth={1.2} strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={`${d} L${ex} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
          <path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${(ex / w) * 100}%`, top: ey, background: "rgba(85,33,245,0.18)" }}
        >
          <span className="absolute left-[3px] top-[3px] h-2 w-2 rounded-full shadow-[0_0_0_2px_#fff]" style={{ background: color }} />
        </span>
      </div>
    );
  }
  const d = path(values, w, height, 8);
  if (!d) {
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden>
        <path d={`M0 ${height - 20} L${w} ${height - 20}`} stroke="#DCD9E5" strokeWidth={2} strokeDasharray="4 6" />
      </svg>
    );
  }
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.14} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${d} L${w} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-dim absolute inset-0 bg-[rgba(18,17,26,0.42)]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px]">
        <div
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={label ?? (typeof title === "string" ? title : undefined)}
          className="anim-sheet max-h-[90dvh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[calc(24px+var(--safe-bottom))] pt-3 outline-none"
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-track" />
          {title !== undefined && (
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="text-[20px] font-extrabold tracking-[-0.02em]">{title}</div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg"
              >
                <CloseIcon />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function SubHeader({ title, back = "/", right }: { title?: string; back?: string; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-bg/90 px-3 pb-2 pt-[calc(10px+var(--safe-top))] backdrop-blur-md">
      <Link href={back} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
        <BackIcon />
      </Link>
      {title && <div className="text-[16px] font-extrabold">{title}</div>}
      <div className="flex h-11 min-w-11 items-center justify-end">{right}</div>
    </div>
  );
}

export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "good" | "bad" | "warn" }) {
  const cls = {
    neutral: "bg-bg text-muted",
    brand: "bg-brand-soft text-brand",
    good: "bg-good-soft text-good-ink",
    bad: "bg-bad-soft text-bad-ink",
    warn: "bg-[#FFF4E5] text-[#9A5B00]",
  }[tone];
  return <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${cls}`}>{children}</span>;
}

export function Bar({ value, tone = "brand" }: { value: number; tone?: "brand" | "good" | "faint" }) {
  const c = tone === "good" ? "bg-up" : tone === "faint" ? "bg-faint" : "bg-brand";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-track">
      <div className={`bar-fill h-full rounded-full ${c}`} style={{ width: `${Math.max(3, value)}%` }} />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between px-1 pb-2 pt-1">
      <h2 className="text-[16px] font-extrabold">{children}</h2>
      {action}
    </div>
  );
}

export function RangeTabs<K extends string>({ value, options, onChange }: { value: K; options: readonly K[]; onChange: (k: K) => void }) {
  return (
    <div className="flex justify-between px-5 pt-2 text-[13px] font-bold text-muted" role="tablist" aria-label="Chart range">
      {options.map((k) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`min-h-[36px] min-w-[44px] rounded-full px-3 transition-colors ${value === k ? "bg-brand text-white" : ""}`}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
