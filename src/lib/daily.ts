export type DailyQ = { q: string; options: { label: string; correct: boolean }[]; why: string };

// One quick scam-spotting question per day.
export const DAILY: DailyQ[] = [
  {
    q: "A stranger says they'll double any crypto you send them as a 'giveaway.' Real or scam?",
    options: [
      { label: "Scam", correct: true },
      { label: "Real, if the account is verified", correct: false },
    ],
    why: "Nobody doubles your money. 'Send X, get 2X back' giveaways are always scams, even from verified or celebrity-looking accounts.",
  },
  {
    q: "A site asks you to 'connect your wallet' to claim a free airdrop you never signed up for. What do you do?",
    options: [
      { label: "Close it", correct: true },
      { label: "Connect, but don't approve anything", correct: false },
    ],
    why: "Surprise airdrops are a common lure. Connecting is often the first step to tricking you into approving a transaction that drains your wallet.",
  },
  {
    q: "Someone you met on a dating app suggests a crypto trading platform where they've 'made a lot.' Red flag?",
    options: [
      { label: "Yes, big red flag", correct: true },
      { label: "Only if they ask for money directly", correct: false },
    ],
    why: "This is how 'pig butchering' scams start: build trust, then steer you to a fake platform that shows fake gains until you try to withdraw.",
  },
  {
    q: "Your friend's account DMs you: 'I'm stuck, can you send $50 in crypto? I'll pay you back tonight.' First move?",
    options: [
      { label: "Call or text them another way to check", correct: true },
      { label: "Send it, it's their account", correct: false },
    ],
    why: "Hacked accounts are used to ask friends for money. Confirm through a different channel before sending anything.",
  },
  {
    q: "You lost money to a scam. A company offers to recover it for an upfront fee. Trust it?",
    options: [
      { label: "No, that's usually a second scam", correct: true },
      { label: "Yes, if they have good reviews", correct: false },
    ],
    why: "Recovery scams target people who already lost money. Real help (like reporting to the FBI's IC3) never charges upfront to 'recover' crypto.",
  },
  {
    q: "An app promises 'guaranteed 2% daily returns' on your crypto. Real or scam?",
    options: [
      { label: "Scam", correct: true },
      { label: "Real, crypto can grow fast", correct: false },
    ],
    why: "2% a day would turn $100 into over $130,000 in a year. Guaranteed high returns are the signature of a Ponzi scheme.",
  },
  {
    q: "A QR code at a coffee shop says 'Scan to get free crypto.' Scan it with your wallet?",
    options: [
      { label: "No", correct: true },
      { label: "Yes, it's just a QR code", correct: false },
    ],
    why: "QR codes can open malicious sites or pre-fill a transaction. Only scan codes from people or places you're intentionally paying.",
  },
];

export function dailyFor(dateKey: string) {
  let h = 0;
  for (const ch of dateKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const q = DAILY[h % DAILY.length];
  return h % 2 ? { ...q, options: [...q.options].reverse() } : q;
}
