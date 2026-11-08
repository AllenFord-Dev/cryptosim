"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { ANSWERS, SCREEN_INTRO, screenKey } from "@/lib/buddy";
import { useApp } from "@/lib/store";
import { BarsIcon, ChevronIcon, FlagIcon, HomeIcon, MarketIcon, SparkleIcon } from "./icons";
import { Sheet } from "./ui";
import { DailySheet, Onboarding, Splash } from "./bits";
import { RecurringRunner } from "./recurring";
import { MenuDrawer, MenuIcon, ResetSheet, TradeHistorySheet } from "./menu";

type UI = { openBuddy: (topic?: string) => void; openMenu: () => void; openHistory: () => void; openDaily: () => void; openReset: () => void };
const UICtx = createContext<UI>({ openBuddy: () => {}, openMenu: () => {}, openHistory: () => {}, openDaily: () => {}, openReset: () => {} });
export const useUI = () => useContext(UICtx);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [buddy, setBuddy] = useState<{ open: boolean; topic?: string }>({ open: false });
  const openBuddy = useCallback((topic?: string) => setBuddy({ open: true, topic }), []);
  const close = useCallback(() => setBuddy({ open: false }), []);
  const [panel, setPanel] = useState<"menu" | "history" | "daily" | "reset" | "intro" | null>(null);
  const shut = useCallback(() => setPanel(null), []);
  const ui: UI = {
    openBuddy,
    openMenu: () => setPanel("menu"),
    openHistory: () => setPanel("history"),
    openDaily: () => setPanel("daily"),
    openReset: () => setPanel("reset"),
  };
  return (
    <UICtx.Provider value={ui}>
      {children}
      <BuddySheet open={buddy.open} topic={buddy.topic} onClose={close} />
      <MenuDrawer
        open={panel === "menu"}
        onClose={shut}
        onHistory={() => setPanel("history")}
        onDaily={() => setPanel("daily")}
        onBuddy={() => openBuddy()}
        onIntro={() => setPanel("intro")}
        onReset={() => setPanel("reset")}
      />
      <TradeHistorySheet open={panel === "history"} onClose={shut} />
      <DailySheet open={panel === "daily"} onClose={shut} />
      <ResetSheet open={panel === "reset"} onClose={shut} />
      {panel === "intro" && <Onboarding onDone={shut} />}
      <Splash />
      <RecurringRunner />
    </UICtx.Provider>
  );
}

function BuddySheet({ open, topic, onClose }: { open: boolean; topic?: string; onClose: () => void }) {
  const pathname = usePathname();
  const { state } = useApp();
  const key = screenKey(pathname);
  const intro = SCREEN_INTRO[key];
  const [expanded, setExpanded] = useState<string | null>(null);
  const ordered = [...ANSWERS].sort((a, b) => Number(b.tags.includes(key)) - Number(a.tags.includes(key)));
  const active = expanded ?? topic ?? null;
  const recent = state.lastMistake && Date.now() - state.lastMistake.at < 1000 * 60 * 60 * 24 * 3 ? state.lastMistake : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="Buddy"
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft">
            <SparkleIcon size={20} color="var(--color-brand)" />
          </span>
          Buddy
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="rounded-[18px] bg-bg p-4">
          <div className="text-[12px] font-bold text-brand">On this screen</div>
          <div className="pt-0.5 text-[16px] font-extrabold">{intro.title}</div>
          <p className="pt-1 text-[14px] leading-[1.45] text-body">{intro.body}</p>
        </div>

        {recent && (
          <div className="rounded-[18px] border border-line p-4">
            <div className="text-[12px] font-bold text-down">Your last mistake</div>
            <div className="pt-0.5 text-[15px] font-extrabold">{recent.title}</div>
            <p className="pt-1 text-[14px] leading-[1.45] text-body">{recent.why}</p>
          </div>
        )}

        <div className="pt-1 text-[13px] font-bold text-muted">Common questions</div>
        <div className="flex flex-col divide-y divide-line rounded-[18px] border border-line">
          {ordered.map((a) => {
            const isOpen = active === a.id;
            return (
              <div key={a.id}>
                <button
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-bold"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? "" : a.id)}
                >
                  {a.q}
                  <ChevronIcon className={`shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} color="var(--color-faint)" />
                </button>
                {isOpen && <p className="px-4 pb-4 text-[14px] leading-[1.5] text-body">{a.a}</p>}
              </div>
            );
          })}
        </div>
        <p className="px-1 pt-1 text-[12px] leading-[1.45] text-muted">
          Buddy&apos;s answers are written ahead of time and checked by a person. It doesn&apos;t give financial advice.
        </p>
      </div>
    </Sheet>
  );
}

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/market", label: "Market", icon: MarketIcon },
  { href: "/missions", label: "Missions", icon: FlagIcon },
  { href: "/skills", label: "Habits", icon: BarsIcon },
];

export function TabBar() {
  const pathname = usePathname();
  const { openBuddy } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-4 pb-[calc(14px+var(--safe-bottom))]">
      <div className="pointer-events-auto flex items-center gap-2.5">
        <nav aria-label="Main" className="glass grid h-[66px] flex-1 grid-cols-4 items-center rounded-full px-1.5">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[54px] flex-col items-center justify-center gap-[3px] rounded-full text-[11px] transition-colors ${
                  active ? "bg-[rgba(85,33,245,0.12)] font-bold text-brand" : "font-semibold text-muted"
                }`}
              >
                {t.href === "/" ? <HomeIcon filled={active} size={20} /> : <Icon size={22} />}
                {t.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => openBuddy()}
          aria-label="Ask Buddy"
          className="glass flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full"
        >
          <SparkleIcon color="var(--color-brand)" />
        </button>
      </div>
    </div>
  );
}

export function TabScreen({
  title,
  right,
  hero,
  children,
  tone = "gray",
}: {
  title: string;
  right?: React.ReactNode;
  hero?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "gray" | "white";
}) {
  return (
    <div className={`min-h-[var(--app-h)] pb-[120px] ${tone === "white" ? "bg-card" : ""}`}>
      <div className={`bg-card pb-1.5 pt-[calc(12px+var(--safe-top))] ${tone === "white" ? "" : "rounded-b-[28px]"}`}>
        <div className="flex items-center justify-between px-5 pt-1">
          <div className="flex items-center gap-2.5">
            <HeaderMenuButton />
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">{title}</h1>
          </div>
          <div className="flex items-center gap-1">{right}</div>
        </div>
        {hero}
      </div>
      {tone === "white" ? children : <div className="flex flex-col gap-3 px-4 pt-4">{children}</div>}
      <TabBar />
    </div>
  );
}

function HeaderMenuButton() {
  const { openMenu } = useUI();
  return (
    <button onClick={openMenu} aria-label="Open menu" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full">
      <MenuIcon />
    </button>
  );
}

export function HeaderButton({
  label,
  onClick,
  href,
  dot,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  const cls = "relative flex h-11 w-11 items-center justify-center rounded-full bg-bg";
  const inner = (
    <>
      {children}
      {dot && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-bg bg-brand" />}
    </>
  );
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}
