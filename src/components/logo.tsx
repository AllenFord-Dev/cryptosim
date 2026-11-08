import type React from "react";

// The CryptoSim mark: a stack of three coins with a spark on the top coin.
type Tone = "light" | "brand";

const COINS = [66, 52, 38];

function Coin({ cy, face, side, ring, gap, top, delay, animate }: { cy: number; face: string; side: string; ring: string; gap?: string; top: boolean; delay: number; animate?: boolean }) {
  const outline = gap ? { stroke: gap, strokeWidth: 2.4 } : {};
  return (
    <g className={animate ? "logo-coin" : undefined} style={animate ? { animationDelay: `${delay}ms` } : undefined}>
      <path d={`M24 ${cy} v9 a26 9 0 0 0 52 0 v-9`} fill={side} {...outline} />
      <ellipse cx="50" cy={cy} rx="26" ry="9" fill={face} {...outline} />
      {(top || !gap) && <ellipse cx="50" cy={cy} rx="17.2" ry="5.9" fill="none" stroke={ring} strokeWidth="2.2" />}
    </g>
  );
}

export function LogoMark({ size = 32, tone = "brand", animate = false }: { size?: number; tone?: Tone; animate?: boolean }) {
  const c =
    tone === "light"
      ? { face: "#F2EEFF", side: "rgba(255,255,255,0.5)", ring: "rgba(85,33,245,0.16)", spark: "#4B1CE6", gap: undefined }
      : { face: "#5521F5", side: "#A88BFF", ring: "rgba(255,255,255,0.3)", spark: "#FFFFFF", gap: undefined };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="shrink-0 overflow-visible">
      {COINS.map((cy, i) => (
        <Coin key={cy} cy={cy} face={c.face} side={c.side} ring={c.ring} gap={c.gap} top={i === 2} delay={i * 120} animate={animate} />
      ))}
      <path
        className={animate ? "logo-spark" : undefined}
        d="M50 32 L51.7 36.3 L56 38 L51.7 39.7 L50 44 L48.3 39.7 L44 38 L48.3 36.3 Z"
        fill={c.spark}
      />
    </svg>
  );
}

export function Wordmark({ size = 22, tone = "brand", animate = false }: { size?: number; tone?: Tone; animate?: boolean }) {
  const crypto = tone === "light" ? "#FFFFFF" : "#12111A";
  const sim = tone === "light" ? "#C9B8FF" : "#5521F5";
  return (
    <span className={`flex items-center ${animate ? "logo-lock" : ""}`} style={{ gap: animate ? 0 : size * 0.32 }}>
      <LogoMark size={size * 1.45} tone={tone} animate={animate} />
      <span className={animate ? "logo-word-clip" : undefined} style={animate ? ({ paddingLeft: size * 0.32 + size * 0.35, marginLeft: -size * 0.35, "--tuck": `${size * 0.67 + 4}px` } as React.CSSProperties) : undefined}>
        <span className={`block leading-none ${animate ? "logo-word" : ""}`} style={{ fontSize: size, letterSpacing: "-0.04em" }}>
          <span style={{ fontWeight: 500, color: crypto }}>crypto</span>
          <span style={{ fontWeight: 800, color: sim }}>sim</span>
        </span>
      </span>
    </span>
  );
}
