import type { SkillId } from "./skills";

// Low-fee networks where USDC is common. All use the same 0x address format, which is why a wrong-network send is easy to make.
export const NETWORKS = ["Base", "Arbitrum", "Optimism", "Polygon"];

export type Visual =
  | {
      type: "chat";
      app: string;
      contact: string;
      sub?: string;
      badge?: boolean;
      messages: { from: "them" | "me"; text: string; mono?: boolean }[];
    }
  | { type: "post"; name: string; handle: string; time: string; text: string; stats: string }
  | { type: "rows"; title: string; rows: { label: string; value: string; mono?: boolean; tone?: "bad" | "good" }[] }
  | { type: "phrase"; title: string; words: string[]; hidden?: number[] }
  | { type: "drop"; coin: string; from: string; to: string; change: string }
  | { type: "note"; text: string };

export type Option = {
  id: string;
  label: string;
  detail?: string;
  mono?: boolean;
  correct: boolean;
  good?: string;
  mistake?: { title: string; why: string; real: string };
};

export type Step = { id: string; kicker: string; prompt: string; visuals: Visual[]; options: Option[] };

export type MissionDef = {
  id: string;
  title: string;
  blurb: string;
  skills: SkillId[];
  minutes: number;
  reward: number;
  loss: number;
  icon: "send" | "megaphone" | "chat" | "key" | "inbox" | "chart";
  flag?: "hype" | "phrase";
  realWallet: { title: string; points: string[] };
  build: (r: Rand) => Step[];
};

export type Rand = () => number;

export function seeded(seed: number): Rand {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pick = <T,>(r: Rand, arr: T[]) => arr[Math.floor(r() * arr.length)];
function shuffle<T>(r: Rand, arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const HEX = "0123456789abcdef";
const hex = (r: Rand, n: number) => Array.from({ length: n }, () => HEX[Math.floor(r() * 16)]).join("");
const address = (r: Rand) => `0x${hex(r, 40)}`;
// A look-alike: same first 6 and last 4 characters, different middle.
const poison = (r: Rand, a: string) => `${a.slice(0, 6)}${hex(r, 32)}${a.slice(-4)}`;
export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
export const chunk = (a: string) => `0x ${a.replace(/^0x/, "").replace(/(.{4})/g, "$1 ").trim()}`;

const WORDS = [
  "maple", "orbit", "candle", "river", "frost", "tiger", "velvet", "harbor", "pixel", "meadow", "lantern", "cobalt",
  "falcon", "ember", "quartz", "willow", "summit", "canyon", "breeze", "copper", "glacier", "nectar", "puzzle", "saddle",
];

// The "Pay a friend back" situation, shared by the step list and the simulated-wallet screen.
export function payBackScenario(r: Rand) {
  const friend = pick(r, ["Maya", "Jordan", "Priya", "Leo", "Sam"]);
  const amount = pick(r, [25, 40, 60]);
  const reason = pick(r, ["the concert tickets", "dinner", "the Uber", "groceries"]);
  // Rotate real networks so the lesson is "ask, then match," not "pick Base."
  const network = pick(r, NETWORKS);
  const real = address(r);
  const fakeA = poison(r, real);
  const fakeB = poison(r, real);
  // Typed from memory: one character in the middle is off.
  const k = 6 + Math.floor(r() * 30);
  const typo = real.slice(0, k) + HEX[(HEX.indexOf(real[k]) + 1 + Math.floor(r() * 14)) % 16] + real.slice(k + 1);
  const cheap = pick(r, NETWORKS.filter((n) => n !== network));
  return { friend, amount, reason, network, real, fakeA, fakeB, typo, cheap };
}

export const MISSIONS: MissionDef[] = [
  {
    id: "pay-back",
    title: "Pay a friend back",
    blurb: "Send money to the right person, on the right network, without falling for a look-alike address.",
    skills: ["sending"],
    minutes: 4,
    reward: 25,
    loss: 40,
    icon: "send",
    realWallet: {
      title: "In a real wallet",
      points: [
        "Crypto transfers can't be reversed. A wrong address means the money is gone.",
        "Scammers send tiny amounts from look-alike addresses so they show up in your history. This is called address poisoning.",
        "For a new contact or a big amount, send a small test first.",
      ],
    },
    build: (r) => {
      const { friend, amount, reason, network, real, fakeA, fakeB } = payBackScenario(r);
      return [
        {
          id: "source",
          kicker: "Step 1 · Get the address",
          prompt: `${friend} wants to be paid back. Where should the address come from?`,
          visuals: [
            {
              type: "chat",
              app: "Messages",
              contact: friend,
              messages: [
                { from: "them", text: `hey! can you send the $${amount} for ${reason}? usdc pls` },
                { from: "them", text: "here's my address" },
                { from: "them", text: real, mono: true },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "msg",
              label: `Copy it from ${friend}'s message`,
              correct: true,
              good: "Right. The address should come straight from the person you're paying, through a channel you trust.",
            },
            {
              id: "history",
              label: "Pick it from my recent activity",
              detail: `I've paid ${friend} before`,
              correct: false,
              mistake: {
                title: "Your history can be poisoned",
                why: "Scammers send you tiny amounts from addresses that start and end like your friend's. They show up in your history, and copying from there is how people pay the wrong person.",
                real: `You'd have sent $${amount} to a stranger. It can't be undone.`,
              },
            },
            {
              id: "memory",
              label: "Type the first and last few characters I remember",
              correct: false,
              mistake: {
                title: "Partial addresses aren't enough",
                why: "Look-alike addresses are generated to match the first and last characters. You need the whole address, copied, not typed from memory.",
                real: "One wrong character sends money to an address nobody controls, or to a scammer.",
              },
            },
          ]),
        },
        {
          id: "match",
          kicker: "Step 2 · Check it",
          prompt: `Your wallet suggests three recent addresses. Which one exactly matches ${friend}'s message?`,
          visuals: [{ type: "rows", title: `${friend}'s message`, rows: [{ label: "Address", value: chunk(real), mono: true }] }],
          options: shuffle(r, [
            {
              id: "real",
              label: chunk(real),
              mono: true,
              correct: true,
              good: "That's the one. The others matched the start and end but not the middle.",
            },
            ...[fakeA, fakeB].map((f, i) => ({
              id: `fake${i}`,
              label: chunk(f),
              mono: true,
              correct: false,
              mistake: {
                title: "A look-alike address",
                why: `This address starts with ${real.slice(0, 6)} and ends with ${real.slice(-4)}, just like ${friend}'s, but the middle is different. Scammers generate these on purpose.`,
                real: `You'd have paid a scammer $${amount}. Check the middle characters, not just the ends.`,
              },
            })),
          ]),
        },
        {
          id: "network",
          kicker: "Step 3 · Before you hit send",
          prompt: `Your wallet filled in the network for you. ${friend} never said which one. What do you do?`,
          visuals: [
            {
              type: "rows",
              title: "Send USDC",
              rows: [
                { label: "To", value: short(real), mono: true },
                { label: "Amount", value: `${amount} USDC` },
                { label: "Network", value: "Ethereum (default)" },
                { label: "Network fee", value: "≈ $1.80" },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "ask",
              label: `Ask ${friend} which network they use, then match it`,
              correct: true,
              good: `Right. ${friend} replies "${network}!" If you'd sent on Ethereum, the money could have landed somewhere their wallet doesn't show.`,
            },
            {
              id: "default",
              label: "Send. The wallet picked it, so it must be right",
              correct: false,
              mistake: {
                title: "Defaults don't know your friend",
                why: `Your wallet picks a network for you, not for ${friend}. ${friend} uses ${network}. Sent on Ethereum, the USDC may never show up in their wallet.`,
                real: "Wrong-network sends are one of the most common ways beginners lose money, and getting it back is hard or impossible.",
              },
            },
            {
              id: "cheap",
              label: "Switch to the network with the lowest fee",
              correct: false,
              mistake: {
                title: "Cheapest isn't the same as correct",
                why: `Fees don't decide where the money can arrive. If you guess a network ${friend} doesn't use, the money may be stuck, even if the fee was low.`,
                real: "Saving $1.80 in fees isn't worth risking the whole payment.",
              },
            },
          ]),
        },
        {
          id: "review",
          kicker: "Step 4 · Review",
          prompt: "Last screen before sending. What do you do?",
          visuals: [
            {
              type: "rows",
              title: "Review send",
              rows: [
                { label: "To", value: short(real), mono: true },
                { label: "Amount", value: `${amount} USDC` },
                { label: "Network", value: `${network} (matched)` },
                { label: "Network fee", value: "≈ $0.01" },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "test",
              label: "Send $1 first, ask if it arrived, then send the rest",
              correct: true,
              good: "Great habit. A small test costs a cent in fees and catches almost every mistake.",
            },
            {
              id: "recheck",
              label: "Compare the full address with the message one more time, then send",
              correct: true,
              good: "Good. A full check right before sending is what catches a swapped address.",
            },
            {
              id: "ends",
              label: "Send. The first and last 4 characters matched",
              correct: false,
              mistake: {
                title: "Matching ends isn't a check",
                why: "Look-alike addresses are built to match the ends. If something swapped the address after you copied it, only a full check or a test send would catch it.",
                real: "Malware that swaps copied addresses is real. The ends still look right.",
              },
            },
          ]),
        },
      ];
    },
  },
  {
    id: "hype-pump",
    title: "The hype pump",
    blurb: "A coin is 'going to the moon' and everyone's posting about it. Practice saying no.",
    skills: ["scams"],
    minutes: 3,
    reward: 25,
    loss: 100,
    icon: "megaphone",
    flag: "hype",
    realWallet: {
      title: "In a real wallet",
      points: [
        "Pump-and-dumps work by getting latecomers to buy so early holders can sell to them.",
        "Urgency, huge promised gains and unknown coins are the pattern. Real opportunities don't expire in two hours.",
        "If a few wallets hold most of a coin, they can crash the price whenever they want.",
      ],
    },
    build: (r) => {
      const coin = pick(r, ["$MOONCAT", "$PEPEX", "$ROCKETDOG", "$GIGACHAD"]);
      const gain = pick(r, ["380%", "612%", "940%"]);
      const handle = pick(r, ["@cryptoking_", "@100xcalls", "@alpha.drops", "@moonmission"]);
      const top = pick(r, [72, 78, 84]);
      return [
        {
          id: "post",
          kicker: "Step 1 · The post",
          prompt: "This is all over your feed and your group chat. What do you do first?",
          visuals: [
            {
              type: "post",
              name: handle.replace("@", "").replace(/[._]/g, " ").trim(),
              handle,
              time: "12m",
              text: `${coin} is up ${gain} this week 🚀🚀 Getting listed on a big exchange TONIGHT. Last chance under $0.01. Don't say I didn't tell you.`,
              stats: "2.4K reposts · 8.1K likes",
            },
          ],
          options: shuffle(r, [
            {
              id: "buy",
              label: "Buy $100 before it's too late",
              correct: false,
              mistake: {
                title: "Urgency is the scam",
                why: "'Last chance' and 'tonight' are there to stop you from thinking. The person posting likely bought early and needs new buyers to sell to.",
                real: "Most coins pushed like this drop 80–100% within days.",
              },
            },
            {
              id: "research",
              label: "Look up who holds it and where it's actually listed",
              correct: true,
              good: "Right. Thirty seconds of checking beats any 'last chance'.",
            },
            {
              id: "dm",
              label: "DM the poster to ask how to buy early",
              correct: false,
              mistake: {
                title: "DMs are where the second scam starts",
                why: "People who reply to these posts get sent fake 'presale' links that drain wallets. Never take buying instructions from a stranger.",
                real: "Fake presale sites ask you to connect your wallet and approve a transaction that empties it.",
              },
            },
          ]),
        },
        {
          id: "facts",
          kicker: "Step 2 · The facts",
          prompt: "Here's what you found. What does it tell you?",
          visuals: [
            {
              type: "rows",
              title: `${coin} at a glance`,
              rows: [
                { label: "Created", value: "4 days ago" },
                { label: "Top 5 wallets own", value: `${top}%`, tone: "bad" },
                { label: "Listed on", value: "1 small exchange" },
                { label: "Poster's account", value: "Made last month" },
                { label: "Paid promotion disclosed", value: "No", tone: "bad" },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "skip",
              label: "A few wallets can dump on everyone else. Skip it",
              correct: true,
              good: `Exactly. When ${top}% sits in five wallets, those holders decide the price.`,
            },
            {
              id: "whales",
              label: "Big holders means insiders believe in it. Buy",
              correct: false,
              mistake: {
                title: "Concentration is a risk, not a signal",
                why: `If five wallets own ${top}%, they can sell all at once and the price collapses. You'd be the exit for them.`,
                real: "This is how 'rug pulls' work: insiders sell, the price goes to near zero.",
              },
            },
            {
              id: "little",
              label: "Buy a little. I can always sell if it drops",
              correct: false,
              mistake: {
                title: "You might not be able to sell",
                why: "Tiny coins on one small exchange often have almost no buyers when the price falls. Some are even coded so regular holders can't sell at all.",
                real: "'I'll just sell' fails exactly when everyone else is trying to sell too.",
              },
            },
          ]),
        },
        {
          id: "dip",
          kicker: "Step 3 · Two hours later",
          prompt: "Now there's a new post: \"Healthy dip, buy now before it bounces!\" What do you do?",
          visuals: [{ type: "drop", coin, from: "$0.0094", to: "$0.0011", change: "−88%" }],
          options: shuffle(r, [
            {
              id: "pass",
              label: "Still a pass",
              correct: true,
              good: "Right. The same people pushing the pump now need buyers for whatever they have left.",
            },
            {
              id: "dipbuy",
              label: "Buy the dip, it's cheap now",
              correct: false,
              mistake: {
                title: "Cheap isn't the same as undervalued",
                why: "A coin that fell 88% can fall another 88%. 'Buy the dip' posts after a dump are usually the last round of the same scheme.",
                real: "Buying after the dump is how people lose twice on one coin.",
              },
            },
          ]),
        },
      ];
    },
  },
  {
    id: "fake-support",
    title: "The fake support DM",
    blurb: "'Support' says your wallet is at risk and needs you to verify it. Practice spotting the trap.",
    skills: ["scams"],
    minutes: 4,
    reward: 25,
    loss: 150,
    icon: "chat",
    flag: "phrase",
    realWallet: {
      title: "In a real wallet",
      points: [
        "No real company will ever ask for your recovery phrase. Not support, not a website, not an AI chat.",
        "Real support doesn't DM you first. Open the app yourself and find Help there.",
        "Searching for a 'support phone number' often leads to fake ads run by scammers.",
      ],
    },
    build: (r) => {
      const channel = pick(r, ["X", "Discord", "Telegram", "Instagram"]);
      const minutes = pick(r, [15, 30, 60]);
      const site = pick(r, ["wallet-verify-secure.com", "secure-walletsupport.net", "verify-my-wallet.io"]);
      const words = shuffle(r, WORDS).slice(0, 12);
      return [
        {
          id: "flag",
          kicker: "Step 1 · The message",
          prompt: "What's the biggest red flag here?",
          visuals: [
            {
              type: "chat",
              app: channel,
              contact: "Wallet Support",
              sub: "Official help team",
              badge: true,
              messages: [
                {
                  from: "them",
                  text: `Hi, we detected suspicious login attempts on your wallet. To prevent permanent loss of funds, please verify ownership within ${minutes} minutes.`,
                },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "first",
              label: "Support messaged me first, with a deadline",
              correct: true,
              good: "Yes. Real support doesn't reach out first, and a countdown is there to rush you.",
            },
            {
              id: "badge",
              label: "Nothing, the account has a checkmark",
              correct: false,
              mistake: {
                title: "Checkmarks can be bought or faked",
                why: `On ${channel}, a badge, a logo and an official-sounding name cost a scammer nothing. What gives it away is that 'support' contacted you.`,
                real: "Impersonation scams like this cost people billions every year.",
              },
            },
            {
              id: "grammar",
              label: "Nothing, the spelling and grammar are fine",
              correct: false,
              mistake: {
                title: "Scams are well written now",
                why: "Many scam messages are polished, often written with AI. Judge the request, not the writing.",
                real: "Clean writing makes these scams more convincing, not less.",
              },
            },
          ]),
        },
        {
          id: "phrase",
          kicker: "Step 2 · The ask",
          prompt: "They send a link and say it's the only way to keep your funds safe. What do you do?",
          visuals: [
            { type: "chat", app: channel, contact: "Wallet Support", badge: true, messages: [{ from: "them", text: `Please complete verification here: ${site}` }] },
            { type: "phrase", title: `${site} asks for`, words: Array(12).fill(""), hidden: [] },
          ],
          options: shuffle(r, [
            {
              id: "enter",
              label: "Enter my recovery phrase so they can protect it",
              correct: false,
              mistake: {
                title: "That's the whole scam",
                why: "Your recovery phrase is the master key. Whoever has it can move everything out of your wallet, from anywhere, and nobody can stop it.",
                real: "Your wallet would be emptied within minutes. There's no one to call to get it back.",
              },
            },
            {
              id: "half",
              label: "Share only the first 6 words to be safe",
              correct: false,
              mistake: {
                title: "Part of the phrase is still too much",
                why: "Half a phrase makes the rest much easier to guess, and the 'verification' will just ask for the other half next.",
                real: "There's no safe amount of your phrase to share.",
              },
            },
            {
              id: "close",
              label: "Never share it. Close the chat and block them",
              correct: true,
              good: "Exactly. Nobody legitimate will ever need your recovery phrase.",
            },
          ]),
        },
        {
          id: "help",
          kicker: "Step 3 · Real help",
          prompt: "You're still a little worried. Where do you go for real help?",
          visuals: [{ type: "phrase", title: "Your recovery phrase (stays on paper)", words, hidden: words.map((_, i) => i) }],
          options: shuffle(r, [
            {
              id: "app",
              label: "Open the wallet app myself and use its Help section",
              correct: true,
              good: "Right. Start from the app or website you already trust, never from a link someone sent.",
            },
            {
              id: "supervisor",
              label: "Reply to the DM and ask for a supervisor",
              correct: false,
              mistake: {
                title: "Every 'supervisor' is the same scammer",
                why: "Escalating inside the scam just gets you a more convincing script. Leave the conversation entirely.",
                real: "Scam teams use 'escalation' to build trust before the ask.",
              },
            },
            {
              id: "search",
              label: "Search 'wallet support phone number' and call the top result",
              correct: false,
              mistake: {
                title: "Search ads can be scams too",
                why: "Scammers buy ads and fake listings for support numbers. Crypto wallets rarely offer phone support at all.",
                real: "Fake support lines are a top way people get talked into giving up their phrase.",
              },
            },
          ]),
        },
      ];
    },
  },
  {
    id: "backup",
    title: "Back up your wallet",
    blurb: "Your new wallet shows a recovery phrase. Practice saving it so you never lose access.",
    skills: ["setup"],
    minutes: 3,
    reward: 25,
    loss: 0,
    icon: "key",
    flag: "phrase",
    realWallet: {
      title: "In a real wallet",
      points: [
        "Lose your recovery phrase and lose your phone, and your money is gone for good.",
        "Screenshots and notes apps often sync to the cloud, where a hacked account exposes them.",
        "Paper in two safe places is boring, and it works.",
      ],
    },
    build: (r) => {
      const words = shuffle(r, WORDS).slice(0, 12);
      const n = Math.floor(r() * 12);
      const decoys = shuffle(r, WORDS.filter((w) => !words.includes(w))).slice(0, 3);
      return [
        {
          id: "save",
          kicker: "Step 1 · Save it",
          prompt: "Your new wallet shows this phrase once. How do you save it?",
          visuals: [{ type: "phrase", title: "Your recovery phrase", words }],
          options: shuffle(r, [
            { id: "paper", label: "Write it on paper and keep it somewhere safe", correct: true, good: "Right. Offline and on paper is the safest simple option." },
            {
              id: "screenshot",
              label: "Take a screenshot",
              correct: false,
              mistake: {
                title: "Screenshots don't stay private",
                why: "Photos usually back up to the cloud, and some malicious apps scan your photos for recovery phrases.",
                real: "If your cloud account is ever hacked, so is your wallet.",
              },
            },
            {
              id: "notes",
              label: "Paste it into my notes app",
              correct: false,
              mistake: {
                title: "Copying it exposes it",
                why: "Your clipboard and notes app can be read by other apps and synced to the cloud. Your phrase should never be typed or pasted anywhere.",
                real: "Clipboard-reading malware specifically looks for recovery phrases.",
              },
            },
            {
              id: "email",
              label: "Email it to myself",
              correct: false,
              mistake: {
                title: "Your inbox is a target",
                why: "Email accounts get hacked all the time, and searching an inbox for '12 words' is easy.",
                real: "One phished email password would give away your whole wallet.",
              },
            },
          ]),
        },
        {
          id: "verify",
          kicker: "Step 2 · Confirm it",
          prompt: `To check your backup, the wallet asks for word #${n + 1}. Use your paper copy.`,
          visuals: [{ type: "phrase", title: "Your paper copy", words }],
          options: shuffle(r, [
            { id: "right", label: words[n], correct: true, good: "Correct. Confirming a word proves your copy is accurate before you need it." },
            ...decoys.map((d) => ({
              id: d,
              label: d,
              correct: false,
              mistake: {
                title: "Count carefully",
                why: `Word #${n + 1} on your paper is "${words[n]}". A single wrong or out-of-order word means the backup won't restore your wallet.`,
                real: "People discover a bad backup at the worst time: when they need it.",
              },
            })),
          ]),
        },
        {
          id: "share",
          kicker: "Step 3 · Keep it yours",
          prompt: "A friend offers to keep a copy of your phrase, \"just in case.\" What do you do?",
          visuals: [],
          options: shuffle(r, [
            {
              id: "keep",
              label: "Thanks, but no. I'll keep a second paper copy in another safe place",
              correct: true,
              good: "Good. Two copies in two places protects against loss without trusting anyone else.",
            },
            {
              id: "trust",
              label: "Sure, I trust them",
              correct: false,
              mistake: {
                title: "Anyone with the phrase owns the wallet",
                why: "Even someone you trust can lose it, have their phone hacked, or be pressured. The phrase isn't a spare key; it's the whole wallet.",
                real: "Friends and family are involved in a surprising share of crypto thefts.",
              },
            },
            {
              id: "text",
              label: "Text it to them so it's backed up",
              correct: false,
              mistake: {
                title: "Now it lives on two phones and a server",
                why: "Text messages are stored and synced. You'd be multiplying the places a thief could find it.",
                real: "There's no way to 'unsend' a recovery phrase.",
              },
            },
          ]),
        },
      ];
    },
  },
  {
    id: "receiving",
    title: "Get paid for a gig",
    blurb: "A client wants to pay you in crypto. Practice sharing the right details and reading the payment.",
    skills: ["receiving"],
    minutes: 3,
    reward: 25,
    loss: 0,
    icon: "inbox",
    realWallet: {
      title: "In a real wallet",
      points: [
        "Always tell people the network along with your address.",
        "Trust your wallet and the block explorer, never a screenshot of a payment.",
        "Once a transaction is confirmed, it's final in both directions.",
      ],
    },
    build: (r) => {
      const amount = pick(r, [50, 80, 120]);
      const gig = pick(r, ["the logo design", "tutoring", "the video edit", "the photo shoot"]);
      const network = pick(r, NETWORKS);
      const mine = address(r);
      return [
        {
          id: "share",
          kicker: "Step 1 · Share your details",
          prompt: "What do you send the client?",
          visuals: [
            {
              type: "chat",
              app: "Messages",
              contact: "Client",
              messages: [{ from: "them", text: `Thanks for ${gig}! I'll pay the $${amount} in USDC. Where should I send it?` }],
            },
            { type: "rows", title: "Your wallet · Receive", rows: [{ label: `Your ${network} address`, value: chunk(mine), mono: true }] },
          ],
          options: shuffle(r, [
            { id: "both", label: `My address, plus "USDC on ${network}"`, correct: true, good: "Right. Address plus network means the money lands where you can see it." },
            {
              id: "addr",
              label: "Just my address",
              correct: false,
              mistake: {
                title: "Say the network too",
                why: "If the client sends on a different network than the one your wallet is watching, the money may never show up.",
                real: "Missing network info is a common reason payments 'disappear'.",
              },
            },
            {
              id: "phrase",
              label: "My recovery phrase, so they can deposit",
              correct: false,
              mistake: {
                title: "Never, for any reason",
                why: "Receiving only needs your address. Your recovery phrase lets someone take everything out.",
                real: "Anyone who asks for your phrase to 'pay you' is stealing from you.",
              },
            },
          ]),
        },
        {
          id: "proof",
          kicker: "Step 2 · The 'proof'",
          prompt: "The client sends an image that says \"Payment complete.\" Your wallet still shows nothing. What do you trust?",
          visuals: [
            { type: "chat", app: "Messages", contact: "Client", messages: [{ from: "them", text: "Sent! Here's the proof. Can you send the final files now?" }, { from: "them", text: "[image: 'Payment complete']" }] },
            { type: "rows", title: "Your wallet", rows: [{ label: `USDC on ${network}`, value: "0.00", tone: "bad" }] },
          ],
          options: shuffle(r, [
            { id: "wallet", label: "My wallet and the block explorer, not the image", correct: true, good: "Exactly. A screenshot is just a picture. The blockchain is the record." },
            {
              id: "image",
              label: "The image. They showed proof",
              correct: false,
              mistake: {
                title: "Screenshots prove nothing",
                why: "Anyone can make an image that says 'payment complete.' Only your wallet or a block explorer shows what actually arrived.",
                real: "Fake payment proof is a common way freelancers and sellers get scammed.",
              },
            },
            {
              id: "wait",
              label: "Send the files and trust it'll show up",
              correct: false,
              mistake: {
                title: "Get paid, then deliver",
                why: "If the money hasn't arrived, you have nothing to show for the work if it never does.",
                real: "Once you deliver, a scammer has no reason to pay.",
              },
            },
          ]),
        },
        {
          id: "read",
          kicker: "Step 3 · Read the payment",
          prompt: "The real payment arrives. What does \"Confirmed\" mean?",
          visuals: [
            {
              type: "rows",
              title: "Transaction details",
              rows: [
                { label: "Status", value: "Confirmed", tone: "good" },
                { label: "Amount", value: `${amount} USDC` },
                { label: "Network", value: network },
                { label: "From", value: short(address(r)), mono: true },
                { label: "Network fee", value: "Paid by sender" },
              ],
            },
          ],
          options: shuffle(r, [
            { id: "final", label: "It's final and can't be reversed", correct: true, good: "Yes. Confirmed means it's recorded on the blockchain for good." },
            {
              id: "cancel",
              label: "The sender can still cancel it for 24 hours",
              correct: false,
              mistake: {
                title: "There's no cancel window",
                why: "Unlike a card payment, a confirmed crypto transfer can't be charged back or canceled by anyone.",
                real: "This is also why sending to the wrong address can't be fixed.",
              },
            },
            {
              id: "bank",
              label: "The sender's bank approved it",
              correct: false,
              mistake: {
                title: "No bank involved",
                why: "Crypto transfers are confirmed by the blockchain network, not a bank. That's why no bank can reverse them either.",
                real: "Knowing who confirms a payment tells you who can (and can't) help.",
              },
            },
          ]),
        },
      ];
    },
  },
  {
    id: "the-dip",
    title: "The dip",
    blurb: "You bought, and the price dropped. Practice staying calm, reading fees, and sticking to a plan.",
    skills: ["trading"],
    minutes: 3,
    reward: 25,
    loss: 60,
    icon: "chart",
    realWallet: {
      title: "In a real wallet",
      points: [
        "Daily swings of 5–10% are normal for most coins. Decide your plan before you buy.",
        "Selling on a dip turns a paper loss into a real one, and you pay fees twice.",
        "Fees and spreads differ a lot between apps. Always open the details before confirming.",
      ],
    },
    build: (r) => {
      const coin = pick(r, ["Bitcoin", "Ethereum", "Solana"]);
      const amount = pick(r, [100, 150, 200]);
      const drop = pick(r, [6, 8, 11]);
      const feePct = pick(r, [1.5, 2, 2.5]);
      return [
        {
          id: "fees",
          kicker: "Step 1 · Before you buy",
          prompt: `You're about to buy $${amount} of ${coin}. What do you check first?`,
          visuals: [
            {
              type: "rows",
              title: "Review order",
              rows: [
                { label: "You pay", value: `$${amount}.00` },
                { label: "Fees and spread", value: "See details ›", tone: "bad" },
                { label: `You get about`, value: `$${(amount * (1 - feePct / 100)).toFixed(2)} of ${coin}` },
              ],
            },
          ],
          options: shuffle(r, [
            {
              id: "fees",
              label: "Open the fee details and see what I'm actually paying",
              correct: true,
              good: `Right. Here, fees and spread take $${((amount * feePct) / 100).toFixed(2)}, which is ${feePct}% gone before the price moves at all.`,
            },
            {
              id: "fast",
              label: "Confirm fast before the price changes",
              correct: false,
              mistake: {
                title: "Speed costs you",
                why: `Rushing is how fees surprise people. On this order, ${feePct}% disappears the moment you buy, and you'd never have looked.`,
                real: "About 1 in 5 crypto owners has been surprised by fees.",
              },
            },
            {
              id: "max",
              label: "Buy more so the fee is worth it",
              correct: false,
              mistake: {
                title: "Percentage fees grow with you",
                why: "Most fees are a percentage, so buying more just pays more. Decide the amount from your plan, not the fee.",
                real: "Bigger orders mean bigger fees, and bigger losses on a swing.",
              },
            },
          ]),
        },
        {
          id: "drop",
          kicker: "Step 2 · An hour later",
          prompt: `${coin} is down ${drop}% since you bought. What do you do?`,
          visuals: [{ type: "drop", coin, from: `$${amount}.00`, to: `$${(amount * (1 - drop / 100)).toFixed(2)}`, change: `−${drop}%` }],
          options: shuffle(r, [
            {
              id: "plan",
              label: "Nothing. Swings like this are normal, and I'm sticking to my plan",
              correct: true,
              good: "Calm call. A drop like this happens often, and nothing about the coin changed in an hour.",
            },
            {
              id: "sell",
              label: "Sell everything before it drops more",
              correct: false,
              mistake: {
                title: "That's panic-selling",
                why: `Selling now locks in the ${drop}% loss and you pay fees again on the way out. Swings like this often reverse, and you'd be out.`,
                real: "Panic-selling after a dip is one of the most common ways beginners lose money.",
              },
            },
            {
              id: "double",
              label: "Buy twice as much to make it back faster",
              correct: false,
              mistake: {
                title: "Chasing losses",
                why: "Buying more just to recover a loss is an emotional bet, not a plan. If it keeps falling, the loss doubles.",
                real: "\"Making it back\" is how a small loss turns into a big one.",
              },
            },
          ]),
        },
        {
          id: "tip",
          kicker: "Step 3 · The tip",
          prompt: "A friend texts: \"Sell now, I heard it's going to crash tonight.\" What do you do?",
          visuals: [{ type: "chat", app: "Messages", contact: "Friend", messages: [{ from: "them", text: "sell now!! someone in a discord said it's crashing tonight" }] }],
          options: shuffle(r, [
            {
              id: "ignore",
              label: "Thank them, and stick to my plan",
              correct: true,
              good: "Right. Rumors aren't information, and nobody can reliably predict tonight's price.",
            },
            {
              id: "listen",
              label: "Sell, just in case",
              correct: false,
              mistake: {
                title: "Rumors move people, not facts",
                why: "Unverified tips spread fastest when prices are already down, and they push people into selling at the worst time.",
                real: "Some \"crash\" rumors are spread on purpose so others can buy cheap.",
              },
            },
          ]),
        },
      ];
    },
  },
];

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);
