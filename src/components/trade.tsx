"use client";

import Link from "next/link";
import { go } from "@/lib/nav";
import { Coach } from "./coach";
import { useMemo, useState } from "react";
import { focusOnMount } from "@/lib/presence";
import { coinById, qtyFmt, usd } from "@/lib/coins";
import { FEE_RATE, SPREAD_RATE, Trade, TradeReason, useApp } from "@/lib/store";
import { usePrices } from "@/lib/prices";
import { CheckIcon, ChevronIcon, SparkleIcon } from "./icons";
import { CoinMark, Sheet } from "./ui";

export function TradeSheet({
  coinId,
  side,
  price,
  onClose,
}: {
  coinId: string;
  side: "buy" | "sell";
  price: number;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const coin = coinById(coinId)!;
  const h = state.holdings[coinId];
  const maxUsd = side === "buy" ? state.cash : h ? h.qty * price * (1 - SPREAD_RATE) : 0;
  const touring = state.tour === "fees" || state.tour === "confirm";
  const [amount, setAmount] = useState(touring && side === "buy" ? "20" : "");
  const [feesOpen, setFeesOpen] = useState(false);
  const [done, setDone] = useState<Trade | null>(null);
  // Every buy (except the guided first trade and stablecoins) and every sell starts with "why".
  const stableCoin = coin.kind === "Stablecoin";
  const [reason, setReason] = useState<TradeReason | null>(null);
  const [okLoss, setOkLoss] = useState<number | null>(null);
  const [asked, setAsked] = useState(touring || (side === "buy" && stableCoin));
  const { quotes } = usePrices();
  const usdAmt = Math.min(parseFloat(amount) || 0, maxUsd + 0.004);

  const q = useMemo(() => {
    if (side === "buy") {
      const fee = usdAmt * FEE_RATE;
      const spread = (usdAmt - fee) * (SPREAD_RATE / (1 + SPREAD_RATE));
      const qty = (usdAmt - fee) / (price * (1 + SPREAD_RATE));
      return { fee, spread, qty, net: qty * price };
    }
    const qty = usdAmt / (price * (1 - SPREAD_RATE));
    const spread = qty * price * SPREAD_RATE;
    const fee = usdAmt * FEE_RATE;
    return { fee, spread, qty, net: usdAmt - fee };
  }, [usdAmt, price, side]);

  const tooMuch = (parseFloat(amount) || 0) > maxUsd + 0.004;
  const valid = usdAmt >= 1 && !tooMuch && !(touring && !feesOpen);
  const chips = side === "buy" ? [25, 50, 100] : [];

  // Keep it small: how much of the practice portfolio this coin would be after the buy.
  const total = state.cash + Object.entries(state.holdings).reduce((t, [id, x]) => t + x.qty * (quotes[id]?.price ?? x.lastBuyPrice), 0);
  const after = (h ? h.qty * price : 0) + (side === "buy" ? usdAmt : 0);
  const share = total > 0 ? after / total : 0;
  const drop = usdAmt * 0.2;

  const confirm = () => {
    if (touring) dispatch({ type: "tour", step: "send" });
    const all = side === "sell" && usdAmt >= Math.floor(maxUsd * 100) / 100;
    dispatch({ type: "trade", coin: coinId, side, usd: usdAmt, price, feeChecked: feesOpen, reason: reason ?? undefined, okLoss: okLoss ?? undefined, all });
    if (side === "buy" && !stableCoin && !touring && share <= 0.25) dispatch({ type: "market", step: "small" });
    const now = Date.now();
    // Same rule the store uses, so Buddy never praises a sell the app just flagged.
    const lastBuy = state.trades.find((t) => t.coin === coinId && t.side === "buy" && !t.auto);
    const panic = side === "sell" && ((!!lastBuy && now - lastBuy.at < 15 * 60 * 1000 && price < lastBuy.price * 0.995) || reason === "panic");
    setDone({ id: `${now}`, coin: coinId, side, usd: usdAmt, qty: q.qty, price, fee: q.fee, feeChecked: feesOpen, panic, at: now });
  };

  if (done) {
    return (
      <Sheet open onClose={onClose} label="Trade complete">
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="anim-pop flex h-16 w-16 items-center justify-center rounded-full bg-up">
            <CheckIcon size={30} color="#fff" />
          </div>
          <div className="pt-4 text-[13px] font-bold text-muted">Practice trade</div>
          <div className="pt-1 text-[24px] font-extrabold tracking-[-0.02em]">
            {done.side === "buy" ? "Bought" : "Sold"} {qtyFmt(done.qty)} {coin.symbol}
          </div>
          <div className="tabular pt-1 text-[15px] text-muted">
            {usd(done.usd)} · fee {usd(done.fee)}
          </div>
        </div>
        <div className="mt-5 rounded-[18px] bg-bg p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-brand">
            <SparkleIcon size={16} color="var(--color-brand)" /> Buddy
          </div>
          <p className="pt-1 text-[14px] leading-[1.5] text-body">
            {done.panic
              ? "You sold at a loss just minutes after buying. Prices swing all the time, and selling on a dip locks the loss in. That's a habit worth breaking before real money is involved."
              : done.feeChecked
                ? "Nice: you opened the fee details before confirming. That's one of your five safe habits, and it adds up on every trade."
                : `Heads up: you didn't open the fee details. This trade cost ${usd(done.fee + q.spread)} in fees and spread. Real apps vary a lot, so checking first is a habit worth building.`}
          </p>
        </div>
        {state.tour === "send" ? (
          <div className="mt-4 flex flex-col gap-3 rounded-[18px] bg-[#12111A] p-4 text-white">
            <div className="text-[12px] font-bold text-white/60">One more, about 2 minutes</div>
            <div className="text-[18px] font-bold leading-tight">Pay a friend back without falling for a look-alike address.</div>
            <button
              onClick={() => {
                onClose();
                go("/missions/pay-back?starter=1");
              }}
              className="btn bg-white text-[#12111A]"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pt-4">
            <button onClick={onClose} className="btn btn-dark">
              Done
            </button>
            <Link href="/skills" className="btn btn-ghost">
              See your habits
            </Link>
          </div>
        )}
      </Sheet>
    );
  }

  if (!asked) {
    const opts: { id: TradeReason; label: string; flag?: boolean }[] =
      side === "buy"
        ? [
            { id: "long", label: "Holding it long-term" },
            { id: "curious", label: "Curious, trying it out" },
            { id: "hype", label: "Saw it hyped online", flag: true },
          ]
        : [
            { id: "profit", label: "Taking some profit" },
            { id: "changed", label: "My plan changed" },
            { id: "panic", label: "It's dropping, I want out", flag: true },
          ];
    return (
      <Sheet open onClose={onClose} title={side === "buy" ? "Before you buy" : "Before you sell"}>
        <div role="radiogroup" aria-label="Why" className="border-t border-line">
          {opts.map((o) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={reason === o.id}
              onClick={() => setReason(o.id)}
              className="flex min-h-[54px] w-full items-center gap-3 border-b border-line py-3 text-left text-[16px] font-bold"
            >
              <span className={`h-[22px] w-[22px] shrink-0 rounded-full ${reason === o.id ? "border-[7px] border-brand" : "border-2 border-track"}`} />
              <span className="flex-1">{o.label}</span>
              {o.flag && <span className="text-[13px] font-bold text-bad-ink">Red flag</span>}
            </button>
          ))}
        </div>
        {side === "buy" && (
          <>
            <div className="pt-5 text-[14px] font-bold text-muted" id="okloss">
              How much could you lose and be OK?
            </div>
            <div role="radiogroup" aria-labelledby="okloss" className="grid grid-cols-4 gap-2 pt-2">
              {[10, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={okLoss === v}
                  onClick={() => setOkLoss(v)}
                  className={`min-h-[42px] rounded-full text-[15px] font-bold ${okLoss === v ? "bg-ink text-card" : "bg-bg"}`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <p className="pt-3 text-[14px] leading-[1.45] text-muted">Coins like {coin.name} can drop 20% in a week. Buy only what you&apos;d be OK seeing fall.</p>
          </>
        )}
        {reason && (reason === "hype" || reason === "panic") && (
          <p className="pt-3 text-[14px] font-semibold leading-[1.45] text-bad-ink">
            {reason === "hype"
              ? "Hype is how pump-and-dumps find buyers. You can still go ahead, but it counts against your plan habit."
              : "Selling because it's dropping usually locks in the loss. You can still go ahead, but it counts against your calm habit."}
          </p>
        )}
        <button disabled={!reason || (side === "buy" && !okLoss)} onClick={() => setAsked(true)} className="btn btn-brand mt-5">
          Continue to amount
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet open onClose={onClose} title={`${side === "buy" ? "Buy" : "Sell"} ${coin.name}`}>
      <div className="flex items-center gap-3 rounded-[18px] bg-bg px-4 py-3">
        <CoinMark id={coinId} size={32} />
        <div className="flex-1 text-[14px] font-semibold text-muted">
          1 {coin.symbol} = <span className="tabular font-extrabold text-ink">{usd(price, price < 10 ? 4 : 2)}</span>
        </div>
        <div className="text-right text-[12px] font-semibold text-muted">
          {side === "buy" ? "Buying power" : "You can sell"}
          <div className="tabular text-[14px] font-extrabold text-ink">{usd(maxUsd)}</div>
        </div>
      </div>

      <label className="block pt-5">
        <span className="text-[13px] font-bold text-muted">Amount in dollars</span>
        <div
          className={`mt-2 flex h-[72px] items-center rounded-[18px] border-[1.5px] bg-card px-4 ${tooMuch ? "border-down" : "border-track focus-within:border-brand"}`}
        >
          <span className="text-[34px] font-extrabold text-faint">$</span>
          <input
            inputMode="decimal"
            ref={focusOnMount(0)}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))}
            placeholder="0"
            aria-invalid={tooMuch}
            style={{ outline: "none" }}
            className="tabular w-full bg-transparent pl-1 text-[34px] font-extrabold tracking-[-0.02em] outline-none placeholder:text-track"
          />
        </div>
      </label>
      {tooMuch && <p className="pt-2 text-[13px] font-bold text-down">That&apos;s more than you have. Max is {usd(maxUsd)}.</p>}
      {side === "buy" && !stableCoin && !touring && usdAmt >= 1 && !tooMuch && (
        <div className="pt-2 text-[13.5px] font-semibold leading-[1.45]">
          {okLoss !== null && (
            <p className={drop > okLoss ? "text-bad-ink" : "text-muted"}>
              A 20% drop would be −{usd(drop)}. You said you could lose ${okLoss} and be OK.
            </p>
          )}
          {share > 0.25 && <p className="text-bad-ink">That puts {Math.round(share * 100)}% of your practice money in {coin.name}. Keeping one coin under 25% is safer.</p>}
        </div>
      )}
      <div className="flex gap-2 pt-3">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setAmount(String(Math.min(c, Math.floor(maxUsd * 100) / 100)))}
            className="min-h-[40px] flex-1 rounded-full bg-bg text-[14px] font-bold"
          >
            ${c}
          </button>
        ))}
        <button onClick={() => setAmount((Math.floor(maxUsd * 100) / 100).toFixed(2))} className="min-h-[40px] flex-1 rounded-full bg-bg text-[14px] font-bold">
          {side === "buy" ? "Max" : "Sell all"}
        </button>
      </div>

      <div className="mt-5 rounded-[18px] border border-line">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[14px] font-semibold text-muted">{side === "buy" ? "You'll get about" : "You'll receive about"}</span>
          <span className="tabular text-[15px] font-extrabold">
            {side === "buy" ? `${qtyFmt(q.qty)} ${coin.symbol}` : usd(q.net)}
          </span>
        </div>
        <button
          data-coach="fees"
          onClick={() => {
            if (state.tour === "fees" && !feesOpen) dispatch({ type: "tour", step: "confirm" });
            setFeesOpen(!feesOpen);
          }}
          aria-expanded={feesOpen}
          className="flex min-h-[52px] w-full items-center justify-between border-t border-line px-4 text-left"
        >
          <span className="text-[14px] font-bold">
            Fees and spread{" "}
            {!feesOpen && <span className="font-semibold text-brand">· see details</span>}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="tabular text-[14px] font-bold">{usd(q.fee + q.spread)}</span>
            <ChevronIcon className={`transition-transform ${feesOpen ? "rotate-90" : ""}`} color="var(--color-faint)" />
          </span>
        </button>
        {feesOpen && (
          <div className="anim-enter flex flex-col gap-2 border-t border-line px-4 py-3.5 text-[14px]">
            <Row label={`Trading fee (${FEE_RATE * 100}%)`} value={usd(q.fee)} />
            <Row label={`Spread (${SPREAD_RATE * 100}%)`} value={usd(q.spread)} />
            <p className="pt-1 text-[13px] leading-[1.45] text-muted">
              The fee is what the app charges. The spread is the gap between buy and sell prices, built into the price you get. Real apps
              charge different amounts, and some hide the spread, so always check.
            </p>
          </div>
        )}
      </div>

      <button data-coach="confirm" disabled={!valid} onClick={confirm} className="btn btn-brand mt-5">
        {valid ? `${side === "buy" ? "Buy" : "Sell"} ${usd(usdAmt)} of ${coin.symbol}` : "Enter an amount ($1 or more)"}
      </button>
      <p className="pt-3 text-center text-[12px] text-muted">Practice money only. Nothing real is bought or sold.</p>
      {state.tour === "fees" && (
        <Coach target="fees" radius={14} step={3} total={3} title="Check the fees first" body="Most people skip this. Open it to see what this trade really costs." />
      )}
      {state.tour === "confirm" && feesOpen && (
        <Coach target="confirm" radius={999} step={3} total={3} title="Now buy" body={`${usd(q.fee + q.spread)} goes to fees and spread. Checking that is one of your five safe habits.`} />
      )}
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="tabular font-bold">{value}</span>
    </div>
  );
}
