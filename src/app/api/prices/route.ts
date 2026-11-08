import { NextResponse } from "next/server";
import { COINS, Quote } from "@/lib/coins";

export const revalidate = 60;

const URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" +
  COINS.map((c) => c.id).join(",") +
  "&sparkline=true&price_change_percentage=24h";

// Clearly labeled sample prices, used only if the live price service can't be reached.
function samplePrices(): Quote[] {
  const base: Record<string, number> = { bitcoin: 100000, ethereum: 3500, solana: 175, ripple: 2.3, dogecoin: 0.19, cardano: 0.62, chainlink: 16, "avalanche-2": 24, "usd-coin": 1 };
  return COINS.map((c, i) => {
    const p = base[c.id];
    const stable = c.id === "usd-coin";
    // Deterministic random walk so sample charts look like real price data.
    let seed = 7 + i * 97;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
    let v = p * 0.97;
    const spark = Array.from({ length: 42 }, () => {
      v *= 1 + rnd() * 0.022 + 0.0008;
      return stable ? 1 + rnd() * 0.0004 : v;
    });
    return { id: c.id, price: spark[spark.length - 1], change24h: stable ? 0 : 1.2 - i, spark };
  });
}

function downsample(arr: number[], n: number) {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]).concat(arr[arr.length - 1]);
}

export async function GET() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(URL, { signal: ctrl.signal, next: { revalidate: 60 }, headers: { accept: "application/json" } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as {
      id: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      sparkline_in_7d?: { price: number[] };
    }[];
    const quotes: Quote[] = data.map((d) => ({
      id: d.id,
      price: d.current_price,
      change24h: d.price_change_percentage_24h ?? 0,
      spark: downsample(d.sparkline_in_7d?.price ?? [d.current_price], 42),
    }));
    if (quotes.length === 0) throw new Error("empty");
    return NextResponse.json({ source: "live", updatedAt: Date.now(), quotes });
  } catch {
    return NextResponse.json({ source: "sample", updatedAt: Date.now(), quotes: samplePrices() });
  }
}
