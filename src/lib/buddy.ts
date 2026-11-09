// Buddy answers are drafted with AI help and reviewed by a person before shipping.
// Nothing here is generated live, so answers are consistent and checked.

export type BuddyAnswer = { id: string; q: string; a: string; tags: string[] };

export const SCREEN_INTRO: Record<string, { title: string; body: string }> = {
  home: {
    title: "Your home base",
    body: "Your portfolio uses real coin prices and practice money. The number that matters most is Safe habits: the behaviors that protect you once real money is involved.",
  },
  market: {
    title: "The market",
    body: "Prices here are real and update every minute. Buying and selling uses practice money, with fees and spread like a real app, so you can learn how they eat into a trade.",
  },
  coin: {
    title: "Reading a coin page",
    body: "The chart shows the last 7 days of real prices. Before you buy, open the fee details: that's one of your safe habits.",
  },
  missions: {
    title: "Missions",
    body: "Each mission recreates a real mistake or scam people fall for. Messing up here costs practice money only, and I'll explain what happened.",
  },
  skills: {
    title: "Skills and habits",
    body: "Skills show what you've practiced. Habits show what you actually do. Neither means you're 'good at crypto'; they mean you've rehearsed the moments that matter.",
  },
  ready: {
    title: "Getting ready for real",
    body: "When you've practiced each skill, a short check confirms you're ready for one small, real test on a free test network. No real money is involved.",
  },
};

export const ANSWERS: BuddyAnswer[] = [
  {
    id: "practice",
    q: "Is any of this real money?",
    a: "No. Prices are real (from CoinGecko), but every dollar here is practice money. You can't deposit or withdraw. Gains and losses reflect the market, not your skill.",
    tags: ["home", "market"],
  },
  {
    id: "fees",
    q: "What are fees and spread?",
    a: "A fee is what the app charges per trade (1% here). The spread is a markup built into the price (0.5% each way here). Together, a $100 buy is worth about $98.50 the moment you make it. Real apps vary a lot, so always open the details.",
    tags: ["market", "coin"],
  },
  {
    id: "stablecoin",
    q: "What's a stablecoin?",
    a: "A coin designed to stay worth $1, like USDC. It's not for growth. People use it to hold or send dollars on a blockchain.",
    tags: ["market", "coin"],
  },
  {
    id: "volatile",
    q: "Why does the price swing so much?",
    a: "Most coins have no earnings or cash flow anchoring their price, so it moves with demand and news. Moves of 5% or more in a day happen often, especially for smaller coins. That's why panic-selling right after a dip is a common, costly mistake.",
    tags: ["coin", "market", "home"],
  },
  {
    id: "phrase",
    q: "What's a recovery phrase?",
    a: "12 or 24 words that fully control your wallet. Anyone who has them can take everything, forever. No real support team, website, or AI will ever need them. Write them on paper; never screenshot them, and only enter them into your own wallet app to restore it.",
    tags: ["missions", "skills", "ready"],
  },
  {
    id: "address",
    q: "How do I know an address is right?",
    a: "Copy it from the person you're paying, through a channel you trust, every time. Never from your history: scammers send tiny amounts from look-alike addresses so they appear there. Check more than the first and last few characters.",
    tags: ["missions", "skills"],
  },
  {
    id: "network",
    q: "What's a network, and why does it matter?",
    a: "The same coin can live on different blockchains (Ethereum, Base, Solana). Sending on the wrong network can mean it lands where they can't see it, or gets stuck for good if it went to an exchange. Ask which network before you send.",
    tags: ["missions", "skills", "ready"],
  },
  {
    id: "undo",
    q: "Can I undo a crypto transfer?",
    a: "No. Once a transfer confirms, nobody can reverse it: not your wallet, not the blockchain. That's why the checks before you hit send matter so much.",
    tags: ["missions", "home"],
  },
  {
    id: "hype",
    q: "How do I spot a pump-and-dump?",
    a: "Urgency ('last chance'), huge promised gains, coins you've never heard of, and strangers who DM you first. The people hyping usually bought early and sell into your buy.",
    tags: ["missions", "market"],
  },
  {
    id: "support",
    q: "How do I tell real support from a scammer?",
    a: "Real support never DMs you first, never asks for your recovery phrase, and never asks you to 'verify' by connecting your wallet to a link. Go to the app yourself and open help from there.",
    tags: ["missions", "skills"],
  },
  {
    id: "testnet",
    q: "What's a testnet?",
    a: "A copy of a blockchain that uses free test coins with no value. It works like the real thing, so it's the safest way to try your first real send.",
    tags: ["ready", "skills"],
  },
];

export function screenKey(pathname: string) {
  if (pathname.startsWith("/coin")) return "coin";
  if (pathname.startsWith("/market")) return "market";
  if (pathname.startsWith("/missions")) return "missions";
  if (pathname.startsWith("/skills")) return "skills";
  if (pathname.startsWith("/ready")) return "ready";
  return "home";
}
