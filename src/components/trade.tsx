"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { coinById, qtyFmt, usd } from "@/lib/coins";
import { FEE_RATE, SPREAD_RATE, Trade, useApp } from "@/lib/store";
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
  const [amount, setAmount] = useState("");
  const [feesOpen, setFeesOpen] = useState(false);
  const [done, setDone] = useState<Trade | null>(null);
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
  const valid = usdAmt >= 1 && !tooMuch;
  const chips = side === "buy" ? [25, 50, 100] : [];

  const confirm = () => {
    dispatch({ type: "trade", coin: coinId, side, usd: usdAmt, price, feeChecked: feesOpen });
    const now = Date.now();
    const panic = side === "sell" && !!h && now - h.lastBuyAt < 15 * 60 * 1000 && price < h.lastBuyPrice * 0.995;
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
            <SparkleIcon size={16} color="#5521F5" /> Buddy
          </div>
          <p className="pt-1 text-[14px] leading-[1.5] text-body">
            {done.panic
              ? "You sold at a loss just minutes after buying. Prices swing all the time, and selling on a dip locks the loss in. That's a habit worth breaking before real money is involved."
              : done.feeChecked
                ? "Nice: you opened the fee details before confirming. That's one of your five safe habits, and it adds up on every trade."
                : `Heads up: you didn't open the fee details. This trade cost ${usd(done.fee + q.spread)} in fees and spread. Real apps vary a lot, so checking first is a habit worth building.`}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          <button onClick={onClose} className="btn btn-dark">
            Done
          </button>
          <Link href="/skills" className="btn btn-ghost">
            See your habits
          </Link>
        </div>
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
          className={`mt-2 flex h-[72px] items-center rounded-[18px] border-[1.5px] bg-white px-4 ${tooMuch ? "border-down" : "border-track focus-within:border-brand"}`}
        >
          <span className="text-[34px] font-extrabold text-faint">$</span>
          <input
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))}
            placeholder="0"
            aria-invalid={tooMuch}
            className="tabular w-full bg-transparent pl-1 text-[34px] font-extrabold tracking-[-0.02em] outline-none placeholder:text-track"
          />
        </div>
      </label>
      {tooMuch && <p className="pt-2 text-[13px] font-bold text-down">That&apos;s more than you have. Max is {usd(maxUsd)}.</p>}
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
          onClick={() => setFeesOpen(!feesOpen)}
          aria-expanded={feesOpen}
          className="flex min-h-[52px] w-full items-center justify-between border-t border-line px-4 text-left"
        >
          <span className="text-[14px] font-bold">
            Fees and spread{" "}
            {!feesOpen && <span className="font-semibold text-brand">· see details</span>}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="tabular text-[14px] font-bold">{usd(q.fee + q.spread)}</span>
            <ChevronIcon className={`transition-transform ${feesOpen ? "rotate-90" : ""}`} color="#A3A0AE" />
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

      <button disabled={!valid} onClick={confirm} className="btn btn-brand mt-5">
        {valid ? `${side === "buy" ? "Buy" : "Sell"} ${usd(usdAmt)} of ${coin.symbol}` : "Enter an amount ($1 or more)"}
      </button>
      <p className="pt-3 text-center text-[12px] text-muted">Practice money only. Nothing real is bought or sold.</p>
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
