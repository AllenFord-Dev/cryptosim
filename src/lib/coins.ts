export type CoinMeta = {
  id: string;
  symbol: string;
  name: string;
  mark: string;
  bg: string;
  fg: string;
  about: string;
  kind: string;
};

export const COINS: CoinMeta[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    mark: "B",
    bg: "#F7931A",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "The first cryptocurrency. Its price can swing a lot in a single day.",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    mark: "E",
    bg: "#627EEA",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "Runs apps and tokens on Ethereum and networks like Base. Also used to pay network fees there.",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    mark: "S",
    bg: "#1B1B2F",
    fg: "#14F195",
    kind: "Volatile",
    about: "The coin of the Solana network, a separate blockchain from Ethereum. Prices swing like other volatile coins.",
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    mark: "X",
    bg: "#23292F",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "Built for moving money between countries quickly. Its price swings like other volatile coins.",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    mark: "D",
    bg: "#C2A633",
    fg: "#FFFFFF",
    kind: "Meme coin",
    about: "Started as a joke and became popular through social media. Meme coins move mostly on hype, so big swings are common.",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    mark: "A",
    bg: "#0033AD",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "The coin of the Cardano network, a blockchain for apps and payments. Prices swing like other volatile coins.",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    mark: "L",
    bg: "#2A5ADA",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "Connects blockchains to real-world data, like prices and weather. LINK pays for that service.",
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    mark: "A",
    bg: "#E84142",
    fg: "#FFFFFF",
    kind: "Volatile",
    about: "The coin of the Avalanche network, another blockchain for apps. Prices swing like other volatile coins.",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    mark: "$",
    bg: "#2775CA",
    fg: "#FFFFFF",
    kind: "Stablecoin",
    about: "A stablecoin designed to stay worth $1. It isn't for growth; people use it to hold or send dollars on a blockchain.",
  },
];

export const coinById = (id: string) => COINS.find((c) => c.id === id);

export type Quote = { id: string; price: number; change24h: number; spark: number[] };

export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const pct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;

export const qtyFmt = (n: number) => (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(4) : n.toFixed(6));
