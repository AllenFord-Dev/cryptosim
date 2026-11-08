// The five skills a first-timer actually needs before using real crypto. Nothing else.
export type SkillId = "setup" | "sending" | "receiving" | "scams" | "trading";

export type LessonCard = { title: string; body: string; visual?: "final" | "phrase" | "address" | "network" | "test" | "receive" | "pending" | "urgency" | "dm" | "returns" | "swing" | "fees" | "panic" };
export type Lesson = {
  cards: LessonCard[];
  check: { q: string; options: { label: string; correct: boolean }[]; why: string };
};

export type Skill = {
  id: SkillId;
  name: string;
  short: string;
  about: string;
  why: string;
  practice: string[];
  prove: string;
  lesson: Lesson;
};

export const SKILLS: Skill[] = [
  {
    id: "setup",
    name: "Protect your wallet",
    short: "Protect",
    about: "Save and guard the recovery phrase that controls your money.",
    why: "About 1 in 10 people who've owned crypto say they lost a private key (SEC Investor Advocate research, 2026).",
    practice: ["backup"],
    prove: "backup",
    lesson: {
      cards: [
        { title: "Your wallet has a master key", body: "Most self-custody wallets give you a recovery phrase: 12 or 24 ordinary words. Those words are your money.", visual: "phrase" },
        { title: "Whoever has the words, has the money", body: "There's no password reset and no bank to call. Lose the words and lose your phone, and the money is gone. Share them, and it can be taken.", visual: "phrase" },
        { title: "Paper, in two safe places", body: "Write the words on paper and keep a second copy somewhere else. Never screenshot them or save them in notes or email. Only ever enter them into your own wallet app to restore it.", visual: "phrase" },
        { title: "Nobody real will ever ask", body: "Not support, not a website, not an app, not an AI chat. Anyone asking for your recovery phrase is trying to steal from you.", visual: "dm" },
      ],
      check: {
        q: "\"Wallet Support\" says they need your recovery phrase to fix a problem. What do you do?",
        options: [
          { label: "Never share it, and close the chat", correct: true },
          { label: "Share it, since they're support", correct: false },
        ],
        why: "No real company ever needs your recovery phrase. Asking for it is the scam.",
      },
    },
  },
  {
    id: "sending",
    name: "Send safely",
    short: "Send",
    about: "Right person, right address, right network, with a test first.",
    why: "21% of US crypto holders have sent crypto to the wrong address (Kraken survey, 2025).",
    practice: ["pay-back"],
    prove: "pay-back",
    lesson: {
      cards: [
        { title: "Sends can't be undone", body: "Once a crypto transfer goes through, nobody can reverse it: not your wallet, not the network, not a bank.", visual: "final" },
        { title: "Copy the address fresh, every time", body: "Get the address from the person, through a channel you trust. Scammers plant look-alike addresses in your history that match the first and last characters.", visual: "address" },
        { title: "Match the network", body: "The same coin can live on different networks, like Base or Ethereum. Send on a different one than they use and it won't show up where they're looking, and if it went to an exchange it may be stuck for good.", visual: "network" },
        { title: "New contact? Send $1 first", body: "A tiny test send costs cents in fees and catches wrong addresses and wrong networks before they cost you.", visual: "test" },
      ],
      check: {
        q: "You're paying a friend. Where should the address come from?",
        options: [
          { label: "A message from your friend, just now", correct: true },
          { label: "Your recent activity, since you've paid them before", correct: false },
        ],
        why: "Your history can contain look-alike addresses planted by scammers. Always get it fresh from the person.",
      },
    },
  },
  {
    id: "receiving",
    name: "Receive and check payments",
    short: "Receive",
    about: "Share the right details, and trust your wallet, not screenshots.",
    why: "Fake \"payment sent\" screenshots are a common way sellers and freelancers get scammed.",
    practice: ["receiving"],
    prove: "receiving",
    lesson: {
      cards: [
        { title: "Share your address and your network", body: "Receiving only needs your address. Always say which network too, like \"USDC on Base,\" so the money lands where your wallet can see it.", visual: "receive" },
        { title: "A screenshot proves nothing", body: "Anyone can make an image that says \"payment complete.\" Only your wallet, or a block explorer, shows what actually arrived.", visual: "pending" },
        { title: "Pending isn't paid", body: "A pending transfer can still fail. Confirmed means it's recorded on the blockchain and final.", visual: "pending" },
      ],
      check: {
        q: "A buyer sends a screenshot saying they paid. Your wallet shows nothing. What do you trust?",
        options: [
          { label: "My wallet and the block explorer", correct: true },
          { label: "The screenshot", correct: false },
        ],
        why: "Screenshots are easy to fake. The blockchain is the record.",
      },
    },
  },
  {
    id: "scams",
    name: "Spot scams",
    short: "Scams",
    about: "Fake support, hype pumps and too-good-to-be-true offers.",
    why: "Americans reported $11.4B in crypto-related scam losses to the FBI in 2025 (FBI IC3).",
    practice: ["fake-support", "hype-pump"],
    prove: "fake-support",
    lesson: {
      cards: [
        { title: "Urgency is the number one tell", body: "\"Last chance,\" \"within 30 minutes,\" \"before it's too late.\" Scams rush you so you don't stop to think.", visual: "urgency" },
        { title: "Real support never DMs you first", body: "Checkmarks and logos are easy to fake. Real support won't DM you on social media, and never asks for your phrase or for you to move funds. Open the app yourself and find Help there.", visual: "dm" },
        { title: "Guaranteed returns don't exist", body: "\"2% a day,\" \"double your crypto,\" \"risk-free.\" Real investments never guarantee returns.", visual: "returns" },
        { title: "Hype posts sell to you", body: "When strangers push a coin with huge gains, they often bought early and need you to buy so they can sell.", visual: "urgency" },
      ],
      check: {
        q: "A verified-looking account DMs you: \"Suspicious login. Verify your wallet in 30 minutes.\" Real or scam?",
        options: [
          { label: "Scam", correct: true },
          { label: "Real, it's verified", correct: false },
        ],
        why: "Support that contacts you first, with a deadline, is a scam every time.",
      },
    },
  },
  {
    id: "trading",
    name: "Buy and sell calmly",
    short: "Trade",
    about: "Know the fees, expect the swings, don't panic-sell.",
    why: "1 in 5 people who've owned crypto say high fees surprised them (SEC Investor Advocate research, 2026).",
    practice: ["the-dip"],
    prove: "the-dip",
    lesson: {
      cards: [
        { title: "Swings are normal", body: "Moves of 5% or more in a day happen often, especially for smaller coins. A drop doesn't mean you did something wrong.", visual: "swing" },
        { title: "Fees cost you on every trade", body: "Apps charge a fee and build a spread into the price. Together they can take a few percent. Always open the details before you confirm.", visual: "fees" },
        { title: "Selling on a dip locks in the loss", body: "Selling right after a drop turns a paper loss into a real one. Decide your plan before you buy, not in the moment.", visual: "panic" },
      ],
      check: {
        q: "You bought Bitcoin an hour ago and it's down 6%. What's the calm move?",
        options: [
          { label: "Stick to the plan I made before buying", correct: true },
          { label: "Sell now before it drops more", correct: false },
        ],
        why: "Swings like this are normal. Panic-selling locks in losses.",
      },
    },
  },
];

export const skillById = (id: string) => SKILLS.find((s) => s.id === id);

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
