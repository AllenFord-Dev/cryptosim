export type SkillId = "setup" | "receiving" | "sending" | "addresses" | "scams" | "trading";

export const SKILLS: { id: SkillId; name: string; about: string; mission: string | null; href: string }[] = [
  { id: "setup", name: "Wallet setup and backup", about: "Saving and protecting your recovery phrase.", mission: "backup", href: "/missions/backup" },
  { id: "receiving", name: "Receiving and reading", about: "Sharing the right details and reading a payment.", mission: "receiving", href: "/missions/receiving" },
  { id: "sending", name: "Sending and fees", about: "Getting money to the right place, with a review first.", mission: "pay-back", href: "/missions/pay-back" },
  { id: "addresses", name: "Addresses and networks", about: "Spotting look-alike addresses and matching networks.", mission: "pay-back", href: "/missions/pay-back" },
  { id: "scams", name: "Scam defense", about: "Hype pumps, fake support and other common traps.", mission: "fake-support", href: "/missions/fake-support" },
  { id: "trading", name: "Buying and selling", about: "Trading calmly, with fees in view.", mission: null, href: "/market" },
];

export type Level = "New" | "Practicing" | "Practiced";

export function levelOf(score: number): Level {
  if (score >= 75) return "Practiced";
  if (score >= 35) return "Practicing";
  return "New";
}

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
