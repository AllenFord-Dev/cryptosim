"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoinRow, NextStepCard, Onboarding, PriceSource, holdingSub } from "@/components/bits";
import { BoltIcon } from "@/components/icons";
import { HeaderButton, TabScreen, useUI } from "@/components/shell";
import { AreaChart, RangeTabs } from "@/components/ui";
import { Coach } from "@/components/coach";
import { TourIntro } from "@/components/tour-intro";
import { PlanSetup, planLabel } from "@/components/plan-setup";
import { activeMoment } from "@/lib/moments";
import { coinById } from "@/lib/coins";
import { CoinMark } from "@/components/ui";
import { COINS, usd } from "@/lib/coins";
import { portfolio } from "@/lib/portfolio";
import { RANGES, RangeKey, useHistory, usePrices } from "@/lib/prices";
import { todayKey, useApp } from "@/lib/store";

export default function Home() {
  const { state, ready, dispatch } = useApp();
  const { quotes } = usePrices();
  const [range, setRange] = useState<RangeKey>("1M");
  const [editPlan, setEditPlan] = useState(false);
  const moment = state.starterDone ? activeMoment(state, quotes) : null;
  const history = useHistory(RANGES.find((r) => r.key === range)!.days, Object.keys(state.holdings));
  const { openDaily } = useUI();
  const p = portfolio(state, quotes, history);
  const dailyReady = state.daily.last !== todayKey();
  const series = p.series;
  const up = p.result >= 0;

  useEffect(() => {
    if (!ready || !state.onboarded || state.starterDone || state.tour) return;
    // Older progress without the starter: skip it if they've already traded, otherwise start the tour.
    dispatch(state.trades.length ? { type: "starter" } : { type: "tour", step: "intro" });
  }, [ready, state.onboarded, state.starterDone, state.tour, state.trades.length, dispatch]);

  // First run: Home renders underneath the welcome, so finishing the name screen slides straight onto it.
  const firstRun = ready && !state.onboarded;

  return (
    <>
      {firstRun && <Onboarding />}
      <TabScreen
        title="Home"
        tone="white"
        right={
          <HeaderButton label={dailyReady ? "Daily scam check, ready" : "Daily scam check, done"} dot={dailyReady} onClick={openDaily}>
            <BoltIcon />
          </HeaderButton>
        }
        hero={
          <>
            <div className="flex flex-col gap-1 px-5 pt-4">
              <div className="text-[14px] font-semibold text-muted">Portfolio</div>
              <div className="tabular text-[46px] font-extrabold leading-[1.05] tracking-[-0.035em]">{usd(p.value)}</div>
              <div className={`tabular text-[14px] font-bold ${Math.abs(p.result) < 0.005 ? "text-muted" : up ? "text-up" : "text-down"}`}>
                {Math.abs(p.result) < 0.005 ? "—" : up ? "▲" : "▼"} {usd(Math.abs(p.result))} ({Math.abs(p.resultPct).toFixed(Math.abs(p.resultPct) < 0.1 ? 2 : 1)}%){" "}
                <span className="font-medium text-muted">from the market</span>
              </div>
              <div className="text-[12px] font-medium text-muted">Results reflect the market, not skill</div>
            </div>
            {state.plan && (
              <button
                onClick={() => setEditPlan(true)}
                className="mx-5 mt-3.5 flex w-[calc(100%-40px)] items-center gap-2.5 rounded-[16px] border-[1.5px] border-line px-3.5 py-2.5 text-left text-[15px]"
              >
                {state.plan.coin && <CoinMark id={state.plan.coin} size={28} />}
                <span className="flex-1">
                  Practicing for <b className="font-extrabold">{planLabel(state.plan)}</b>
                </span>
                <span className="text-[14px] font-bold text-brand">Edit</span>
              </button>
            )}
            <div className="pt-3.5">
              {p.positions.length > 0 ? (
                <AreaChart values={series} height={168} />
              ) : (
                <div className="relative flex h-[168px] items-center justify-center">
                  <div className="absolute inset-x-0 top-1/2 border-t-[1.5px] border-dashed border-track" />
                  <Link
                    href="/market"
                    className="relative flex min-h-[44px] items-center rounded-full bg-brand-soft px-5 text-[14px] font-bold text-brand"
                  >
                    Make your first practice trade
                  </Link>
                </div>
              )}
            </div>
            {p.positions.length > 0 && <RangeTabs value={range} options={RANGES.map((r) => r.key)} onChange={setRange} />}
            <div className="pb-4" />
          </>
        }
      >
        <div className="px-5 pt-2">
          {moment ? (
            <div className="rounded-[22px] bg-bg p-[18px]">
              <div className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.025em]">
                {coinById(moment.coin)?.name} fell {Math.abs(moment.change * 100).toFixed(0)}% since you bought
              </div>
              <div className="pt-1 text-[14.5px] text-body">Most first-timers sell here. What do you do?</div>
              <Link href={`/moment/${moment.coin}`} className="btn btn-brand mt-4 !h-12">
                Decide
              </Link>
            </div>
          ) : (
            <NextStepCard />
          )}
        </div>

        <section aria-labelledby="coins" className="px-5 pt-7">
          <div className="flex items-baseline justify-between pb-1">
            <h2 id="coins" className="text-[18px] font-extrabold tracking-[-0.015em]">
              {p.positions.length ? "Your coins" : "Popular coins"}
            </h2>
            <Link href="/market" className="text-[14px] font-bold text-brand">
              See market
            </Link>
          </div>
          <div className="border-t border-line">
            {p.positions.length
              ? p.positions.map((pos) => <CoinRow key={pos.id} id={pos.id} sub={holdingSub(pos.id, pos.qty)} value={usd(pos.value)} change={pos.change24h} />)
              : COINS.map((c) => (
                  <CoinRow
                    key={c.id}
                    id={c.id}
                    sub={c.kind === "Stablecoin" ? "Stablecoin" : c.symbol}
                    value={quotes[c.id] ? usd(quotes[c.id].price, quotes[c.id].price < 10 ? 2 : 0) : "—"}
                    change={quotes[c.id]?.change24h ?? 0}
                  />
                ))}
          </div>
        </section>
        <div className="px-5 pt-4">
          <PriceSource />
        </div>
        {(editPlan || (ready && state.starterDone && !state.planAsked && !state.tour)) && <PlanSetup onDone={() => setEditPlan(false)} />}
        {state.tour === "intro" && <TourIntro onStart={() => dispatch({ type: "tour", step: "coin" })} />}
        {state.tour === "coin" && (
          <Coach
            target="coin-bitcoin"
            radius={14}
            step={1}
            total={3}
            title="Your first trade"
            body="Real Bitcoin price, practice money. Tap Bitcoin to start."
          />
        )}
      </TabScreen>
    </>
  );
}
