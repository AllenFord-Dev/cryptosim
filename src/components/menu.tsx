"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { coinById, qtyFmt, usd } from "@/lib/coins";
import { habits, useApp } from "@/lib/store";
import { BoltIcon, ChevronIcon, CloseIcon, ExternalIcon, HistoryIcon, InfoIcon, ShieldIcon, SparkleIcon } from "./icons";
import { Sheet } from "./ui";

export const PROJECT_URL = "https://github.com/AllenFord-Dev/cryptosim";

export function MenuDrawer({
  open,
  onClose,
  onHistory,
  onDaily,
  onBuddy,
  onIntro,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  onHistory: () => void;
  onDaily: () => void;
  onBuddy: () => void;
  onIntro: () => void;
  onReset: () => void;
}) {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.name);
  const panel = useRef<HTMLDivElement>(null);
  const h = habits(state);
  const missionsPlayed = Object.values(state.missions).reduce((n, m) => n + m.done, 0);

  useEffect(() => {
    if (!open) return;
    setName(state.name);
    setEditing(false);
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, state.name]);

  if (!open) return null;
  const go = (fn: () => void) => () => {
    onClose();
    fn();
  };
  const initial = (state.name || "You").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px] overflow-hidden">
      <div className="anim-dim absolute inset-0 bg-[rgba(18,17,26,0.42)]" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="anim-drawer absolute inset-y-0 left-0 flex w-[86%] max-w-[350px] flex-col overflow-y-auto bg-white pb-[calc(20px+var(--safe-bottom))] pt-[calc(12px+var(--safe-top))] outline-none"
      >
        <div className="flex items-center justify-between px-5 pt-1">
          <span className="text-[13px] font-bold text-muted">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-full bg-bg">
            <CloseIcon />
          </button>
        </div>

        <div className="flex items-center gap-3.5 px-5 pt-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-[22px] font-extrabold text-white" aria-hidden>
            {initial}
          </div>
          {editing ? (
            <form
              className="flex flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                dispatch({ type: "onboard", name });
                setEditing(false);
              }}
            >
              <input
                id="menu-name"
                autoFocus
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your first name"
                className="h-11 min-w-0 flex-1 rounded-[12px] border-[1.5px] border-track px-3 text-[16px] font-semibold outline-none focus:border-brand"
              />
              <button type="submit" className="h-11 rounded-full bg-brand px-4 text-[14px] font-bold text-white">
                Save
              </button>
            </form>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[20px] font-extrabold tracking-[-0.02em]">{state.name || "Practice account"}</div>
              <button onClick={() => setEditing(true)} className="min-h-[28px] text-[13px] font-bold text-brand">
                Edit name
              </button>
            </div>
          )}
        </div>

        <div className="mx-5 mt-4 grid grid-cols-3 rounded-[16px] bg-bg py-3 text-center">
          <Stat n={`${h.lockedIn}/${h.total}`} label="Habits" />
          <Stat n={String(missionsPlayed)} label="Missions" />
          <Stat n={String(state.trades.length)} label="Trades" />
        </div>

        <nav className="flex flex-col px-3 pt-4" aria-label="Menu">
          <Item icon={<HistoryIcon size={20} />} label="Trade history" onClick={go(onHistory)} />
          <Item icon={<BoltIcon size={20} />} label="Daily scam check" onClick={go(onDaily)} />
          <Item icon={<ShieldIcon size={20} />} label="Readiness check" href="/ready" onClick={onClose} />
          <Item icon={<SparkleIcon size={20} />} label="Ask Buddy" onClick={go(onBuddy)} />
          <div className="mx-2 my-2 h-px bg-line" />
          <Item icon={<InfoIcon size={20} />} label="How CryptoSim works" onClick={go(onIntro)} />
          <Item icon={<ExternalIcon size={18} />} label="About this project" href={PROJECT_URL} external onClick={onClose} />
        </nav>

        <div className="mt-auto px-5 pt-6">
          <button onClick={go(onReset)} className="min-h-[44px] text-[14px] font-bold text-down">
            Reset practice progress
          </button>
          <p className="pt-1 text-[12px] leading-[1.45] text-faint">
            Practice money only. Progress is saved on this device. CryptoSim isn&apos;t financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="tabular text-[18px] font-extrabold">{n}</div>
      <div className="text-[11px] font-semibold text-muted">{label}</div>
    </div>
  );
}

function Item({
  icon,
  label,
  onClick,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}) {
  const cls = "flex min-h-[52px] items-center gap-3.5 rounded-[14px] px-2.5 text-[16px] font-bold hover:bg-bg";
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-brand-soft text-brand">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronIcon color="#C9C6D4" />
    </>
  );
  if (href && external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>
        {inner}
      </a>
    );
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} className={`${cls} text-left`}>
      {inner}
    </button>
  );
}

export function TradeHistorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useApp();
  return (
    <Sheet open={open} onClose={onClose} title="Trade history">
      {state.trades.length === 0 ? (
        <p className="pb-4 text-[15px] text-muted">No trades yet. Pick a coin in the Market to make your first practice trade.</p>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {state.trades.map((t) => {
            const c = coinById(t.coin);
            if (!c) return null;
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="text-[15px] font-bold">
                    {t.side === "buy" ? "Bought" : "Sold"} {c.name}
                  </div>
                  <div className="text-[12px] text-muted">
                    {new Date(t.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · fee {usd(t.fee)}
                    {t.feeChecked ? " · checked fees" : ""}
                    {t.panic ? " · quick sell at a loss" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="tabular text-[14px] font-extrabold">{usd(t.usd)}</div>
                  <div className="tabular text-[12px] text-muted">
                    {qtyFmt(t.qty)} {c.symbol}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}

export function ResetSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  return (
    <Sheet open={open} onClose={onClose} title="Reset progress?">
      <p className="text-[15px] leading-[1.5] text-body">
        This clears your practice money, coins, missions, skills and habits on this device. You&apos;ll start over with $1,000.
      </p>
      <div className="flex flex-col gap-2.5 pt-5">
        <button
          onClick={() => {
            dispatch({ type: "reset" });
            onClose();
          }}
          className="btn bg-down text-white"
        >
          Reset everything
        </button>
        <button onClick={onClose} className="btn btn-ghost">
          Cancel
        </button>
      </div>
    </Sheet>
  );
}

export function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
