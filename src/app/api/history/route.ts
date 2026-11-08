import { NextRequest, NextResponse } from "next/server";
import { COINS } from "@/lib/coins";

const RANGES = new Set(["1", "7", "30", "90", "365"]);
const POINTS = 120;

function downsample(arr: number[], n: number) {
  if (arr.length <= n) return arr;
  const step = (arr.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => arr[Math.round(i * step)]);
}

// Clearly labeled sample history, used only if the live price service can't be reached.
function sample(id: string, days: number) {
  const base: Record<string, number> = { bitcoin: 100000, ethereum: 3500, solana: 175, ripple: 2.3, dogecoin: 0.19, cardano: 0.62, chainlink: 16, "avalanche-2": 24, "usd-coin": 1 };
  let seed = [...`${id}${days}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
  const vol = 0.012 * Math.sqrt(days / 7);
  let v = base[id] * (1 - vol * 2);
  return Array.from({ length: POINTS }, () => {
    v *= 1 + rnd() * vol + vol * 0.04;
    return id === "usd-coin" ? 1 + rnd() * 0.0006 : v;
  });
}

async function fetchCoin(id: string, days: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
      signal: ctrl.signal,
      next: { revalidate: days === "1" ? 300 : 3600 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { prices: [number, number][] };
    if (!data.prices?.length) throw new Error("empty");
    return downsample(
      data.prices.map((p) => p[1]),
      POINTS,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const days = req.nextUrl.searchParams.get("days") ?? "30";
  if (!RANGES.has(days)) return NextResponse.json({ error: "bad range" }, { status: 400 });
  // Only fetch the coins the screen needs: the free price API allows few requests per minute.
  const wanted = (req.nextUrl.searchParams.get("ids") ?? "").split(",").filter((id) => COINS.some((c) => c.id === id)).slice(0, 10);
  const ids = wanted.length ? wanted : ["bitcoin"];
  const results = await Promise.allSettled(ids.map((id) => fetchCoin(id, days)));
  const live = results.every((r) => r.status === "fulfilled");
  const series = Object.fromEntries(
    ids.map((id, i) => {
      const r = results[i];
      return [id, r.status === "fulfilled" ? r.value : sample(id, Number(days))];
    }),
  );
  return NextResponse.json(
    { source: live ? "live" : "sample", days: Number(days), series },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
  );
}
