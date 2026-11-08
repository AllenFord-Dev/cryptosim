"use client";

import { Visual } from "@/lib/missions";
import { CheckIcon } from "./icons";

export function Visuals({ visuals }: { visuals: Visual[] }) {
  if (!visuals.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {visuals.map((v, i) => (
        <VisualBlock key={i} v={v} />
      ))}
    </div>
  );
}

function VisualBlock({ v }: { v: Visual }) {
  switch (v.type) {
    case "chat":
      return (
        <div className="overflow-hidden rounded-[20px] bg-white">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-[14px] font-extrabold text-muted">
              {v.contact.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[15px] font-bold">
                {v.contact}
                {v.badge && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1D9BF0]" aria-label="Verified badge">
                    <CheckIcon size={10} color="#fff" />
                  </span>
                )}
              </div>
              <div className="text-[12px] text-muted">{v.sub ? `${v.sub} · ` : ""}{v.app}</div>
            </div>
            <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">Practice</span>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            {v.messages.map((m, k) => (
              <div
                key={k}
                className={`max-w-[88%] rounded-[18px] px-3.5 py-2.5 text-[15px] leading-[1.4] ${
                  m.from === "me" ? "self-end rounded-br-[6px] bg-brand text-white" : "self-start rounded-bl-[6px] bg-bg"
                } ${m.mono ? "break-all font-mono text-[13px]" : ""}`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      );
    case "post":
      return (
        <div className="rounded-[20px] bg-white p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE7C2] text-[16px]">🚀</div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold capitalize">{v.name}</div>
              <div className="text-[12px] text-muted">
                {v.handle} · {v.time}
              </div>
            </div>
            <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">Practice</span>
          </div>
          <p className="pt-3 text-[15px] leading-[1.45]">{v.text}</p>
          <div className="pt-3 text-[12px] font-semibold text-muted">{v.stats}</div>
        </div>
      );
    case "rows":
      return (
        <div className="rounded-[20px] bg-white px-4 py-3">
          <div className="pb-1 text-[13px] font-bold text-muted">{v.title}</div>
          {v.rows.map((r, k) => (
            <div key={k} className={`flex items-start justify-between gap-4 py-2 ${k ? "border-t border-line" : ""}`}>
              <span className="shrink-0 text-[14px] text-muted">{r.label}</span>
              <span
                className={`text-right text-[14px] font-bold ${r.mono ? "font-mono text-[13px] leading-[1.5]" : ""} ${
                  r.tone === "bad" ? "text-down" : r.tone === "good" ? "text-up" : ""
                }`}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      );
    case "phrase": {
      const form = v.words.every((w) => w === "");
      return (
        <div className={`rounded-[20px] p-4 ${form ? "border-[1.5px] border-dashed border-down/50 bg-down-soft" : "bg-white"}`}>
          <div className={`pb-3 text-[13px] font-bold ${form ? "text-down" : "text-muted"}`}>{v.title}</div>
          <div className="grid grid-cols-3 gap-2">
            {v.words.map((w, k) => {
              const hidden = v.hidden?.includes(k);
              return (
                <div key={k} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-bold ${form ? "bg-white/70" : "bg-bg"}`}>
                  <span className="text-[11px] text-faint">{k + 1}</span>
                  {form ? <span className="h-0.5 flex-1 rounded bg-track" /> : hidden ? <span className="tracking-widest text-faint">•••••</span> : w}
                </div>
              );
            })}
          </div>
          {form && <p className="pt-3 text-[12px] font-semibold text-down">A form asking for all 12 words.</p>}
        </div>
      );
    }
    case "drop":
      return (
        <div className="rounded-[20px] bg-white p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-extrabold">{v.coin}</span>
            <span className="text-[15px] font-extrabold text-down">{v.change}</span>
          </div>
          <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden className="mt-2">
            <path
              d="M0 70 L20 66 L40 60 L60 52 L80 40 L100 30 L115 18 L130 10 L140 14 L150 30 L160 52 L172 64 L185 70 L200 76 L220 78 L240 80 L260 79 L280 82 L300 83"
              fill="none"
              stroke="var(--color-down)"
              strokeWidth={2.2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between pt-1 text-[12px] font-semibold text-muted">
            <span>Peak {v.from}</span>
            <span>Now {v.to}</span>
          </div>
        </div>
      );
    case "note":
      return <div className="rounded-[18px] bg-brand-tint px-4 py-3 text-[14px] leading-[1.45] text-body">{v.text}</div>;
  }
}
