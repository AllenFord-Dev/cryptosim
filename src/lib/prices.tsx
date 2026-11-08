"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Quote } from "./coins";

type Prices = { quotes: Record<string, Quote>; source: "live" | "sample" | "loading"; updatedAt: number };

const Ctx = createContext<Prices>({ quotes: {}, source: "loading", updatedAt: 0 });

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>({ quotes: {}, source: "loading", updatedAt: 0 });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        const data = (await res.json()) as { source: "live" | "sample"; updatedAt: number; quotes: Quote[] };
        if (!alive) return;
        setPrices({
          source: data.source,
          updatedAt: data.updatedAt,
          quotes: Object.fromEntries(data.quotes.map((q) => [q.id, q])),
        });
      } catch {
        // Keep the last prices we had.
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return <Ctx.Provider value={prices}>{children}</Ctx.Provider>;
}

export const usePrices = () => useContext(Ctx);

export const RANGES = [
  { key: "1D", days: 1 },
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "1Y", days: 365 },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];

const historyCache = new Map<string, Record<string, number[]>>();

// Price history for the given coins over a range, cached for the visit.
export function useHistory(days: number, ids: string[]) {
  const key = `${days}:${[...ids].sort().join(",")}`;
  const [series, setSeries] = useState<Record<string, number[]> | null>(historyCache.get(key) ?? null);
  useEffect(() => {
    let alive = true;
    if (!ids.length) {
      setSeries(null);
      return;
    }
    const cached = historyCache.get(key);
    if (cached) {
      setSeries(cached);
      return;
    }
    setSeries(null);
    fetch(`/api/history?days=${days}&ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((d: { series: Record<string, number[]> }) => {
        historyCache.set(key, d.series);
        if (alive) setSeries(d.series);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return series;
}

export function changeOver(values: number[] | undefined) {
  if (!values || values.length < 2 || !values[0]) return 0;
  return ((values[values.length - 1] - values[0]) / values[0]) * 100;
}
