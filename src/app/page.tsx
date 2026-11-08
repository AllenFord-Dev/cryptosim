"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoinRow, HabitCard, Onboarding, PriceSource, holdingSub } from "@/components/bits";
import { BoltIcon } from "@/components/icons";
import { HeaderButton, TabScreen, useUI } from "@/components/shell";
import { AreaChart, RangeTabs } from "@/components/ui";
import { COINS, usd } from "@/lib/coins";
import { portfolio } from "@/lib/portfolio";
import { RANGES, RangeKey, useHistory, usePrices } from "@/lib/prices";
import { todayKey, useApp } from "@/lib/store";

export default function Home() {
  const { state, ready } = useApp();
  const router = useRouter();
  const { quotes } = usePrices();
  const [range, setRange] = useState<RangeKey>("1M");
  const history = useHistory(RANGES.find((r) => r.key === range)!.days, Object.keys(state.holdings));
  const { openDaily } = useUI();
  const p = portfolio(state, quotes, history);
  const dailyReady = state.daily.last !== todayKey();
  const series = p.series;
  const up = p.result >= 0;

  useEffect(() => {
    if (ready && state.onboarded && !state.starterDone) router.replace("/start");
  }, [ready, state.onboarded, state.starterDone, router]);

  if (ready && !state.onboarded) return <Onboarding />;

  return (
    <TabScreen
      title="Home"
      right={
        <HeaderButton label={dailyReady ? "Daily scam check, ready" : "Daily scam check, done"} dot={dailyReady} onClick={openDaily}>
          <BoltIcon />
        </HeaderButton>
      }
      hero={
        <>
          <div className="flex flex-col gap-1 px-6 pt-4">
            <div className="text-[14px] font-semibold text-muted">Portfolio</div>
            <div className="tabular text-[46px] font-extrabold leading-[1.05] tracking-[-0.035em]">{usd(p.value)}</div>
            <div className={`tabular text-[14px] font-bold ${Math.abs(p.result) < 0.005 ? "text-muted" : up ? "text-up" : "text-down"}`}>
              {Math.abs(p.result) < 0.005 ? "—" : up ? "▲" : "▼"} {usd(Math.abs(p.result))} ({Math.abs(p.resultPct).toFixed(1)}%){" "}
              <span className="font-medium text-muted">from the market</span>
            </div>
            <div className="text-[12px] font-medium text-muted">Results reflect the market, not skill</div>
          </div>
          <div className="pt-3.5">
            {p.positions.length > 0 ? (
              <AreaChart values={series} height={168} />
            ) : (
              <div className="relative flex h-[168px] items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 border-t-[1.5px] border-dashed border-track" />
                <Link href="/market" className="relative flex min-h-[44px] items-center rounded-full bg-brand-soft px-5 text-[14px] font-bold text-brand">
                  Make your first practice trade
                </Link>
              </div>
            )}
          </div>
          {p.positions.length > 0 && (
            <RangeTabs value={range} options={RANGES.map((r) => r.key)} onChange={setRange} />
          )}
          <div className="pb-4" />
        </>
      }
    >
      <HabitCard />

      <div className="rounded-[20px] bg-white px-4 pb-1.5 pt-3.5">
        <div className="flex items-baseline justify-between pb-1">
          <span className="text-[16px] font-extrabold">{p.positions.length ? "Your coins" : "Popular coins"}</span>
          <Link href="/market" className="text-[13px] font-bold text-brand">
            See market
          </Link>
        </div>
        {p.positions.length
          ? p.positions.map((pos, i) => (
              <CoinRow
                key={pos.id}
                id={pos.id}
                sub={holdingSub(pos.id, pos.qty)}
                value={usd(pos.value)}
                change={pos.change24h}
                last={i === p.positions.length - 1}
              />
            ))
          : COINS.map((c, i) => (
              <CoinRow
                key={c.id}
                id={c.id}
                sub={c.kind === "Stablecoin" ? "Stablecoin" : c.symbol}
                value={quotes[c.id] ? usd(quotes[c.id].price, quotes[c.id].price < 10 ? 2 : 0) : "—"}
                change={quotes[c.id]?.change24h ?? 0}
                last={i === COINS.length - 1}
              />
            ))}
      </div>
      <PriceSource />
    </TabScreen>
  );
}
