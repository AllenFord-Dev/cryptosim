import type React from "react";

type Tone = "light" | "brand";

export function LogoMark({ size = 32, animate = false }: { size?: number; tone?: Tone; animate?: boolean }) {
  // The CryptoSim mark: one purple coin, tilted, with the spark stamped on its face.
  const w = Math.round(size * 1.3);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/coin.png" alt="" aria-hidden width={w} height={Math.round((w * 319) / 512)} className={`shrink-0 select-none ${animate ? "logo-coin" : ""}`} draggable={false} />
  );
}

export function Wordmark({ size = 22, tone = "brand", animate = false }: { size?: number; tone?: Tone; animate?: boolean }) {
  void tone;
  const crypto = "#C9B8FF";
  const sim = "#FFFFFF";
  return (
    <span className={`flex items-center ${animate ? "logo-lock" : ""}`} style={{ gap: animate ? 0 : size * 0.32 }}>
      <LogoMark size={size * 1.45} animate={animate} />
      <span className={animate ? "logo-word-clip" : undefined} style={animate ? ({ paddingLeft: size * 0.32 + size * 0.35, marginLeft: -size * 0.35, "--tuck": `${size * 0.67 + 4}px` } as React.CSSProperties) : undefined}>
        <span className={`block leading-none ${animate ? "logo-word" : ""}`} style={{ fontSize: size, letterSpacing: "-0.04em" }}>
          <span style={{ fontWeight: 400, color: crypto }}>crypto</span>
          <span style={{ fontWeight: 800, color: sim }}>sim</span>
        </span>
      </span>
    </span>
  );
}
