# CryptoSim

**Make your first crypto mistakes with fake money.**

CryptoSim is a practice crypto wallet and market for first-timers (18–25). You trade real coins at live prices with practice money, play missions that recreate the scams and slip-ups that cost real people real money, and build five safe habits before trying one small, real send on a free test network.

**Try it:** [cryptosim-rose.vercel.app](https://cryptosim-rose.vercel.app) (best on a phone; add it to your home screen)

> Everything in CryptoSim is practice money. Nothing can be deposited, withdrawn or lost.

## Why

Crypto's biggest barriers for newcomers aren't prices; they're irreversible mistakes and scams. In 2025 the FBI's IC3 logged $11.4B in reported crypto fraud losses, and first-timers are told to "be careful" without ever getting to practice the moments that matter: copying an address, picking a network, spotting fake support, ignoring a hype pump.

CryptoSim gives them a place to rehearse those moments where mistakes are free.

## What's in the app

| Area | What it does |
| --- | --- |
| **Home** | Practice portfolio at live prices, a chart (1D–1Y), and one next step tied to the habit you're building. |
| **Market** | Buy and sell BTC, ETH, SOL and USDC with practice money. 1% fee and 0.5% spread, with a fee breakdown you can open (and that counts toward a habit). |
| **Missions** | Five scenario missions with randomized variations: paying a friend back (address poisoning, wrong network), a hype pump, a fake support DM, backing up a wallet, and getting paid for a gig. |
| **Buddy** | Explains every mistake and answers common questions. Content is written ahead of time and human-reviewed; there's no live AI in the app. |
| **Skills** | Five safe habits (locked in / practicing / not yet) and a six-part skill map. No overall score: the app never implies you're "good at crypto." |
| **Readiness + graduation** | A five-scenario check, then a guided real send on Base Sepolia (a free test network), verified on the block explorer. |
| **Daily scam check** | One quick scam-spotting question per day. |

## Product principles

- **Habits, not hype.** Profit is shown so the practice feels real, but progress is measured in habits.
- **Results reflect the market, not skill.** Gains exclude mission rewards and are labeled as market results.
- **Nothing that works as the real thing.** No real brands, no realistic proof-of-payment, everything labeled practice.

## Tech

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- Live prices and history from the CoinGecko public API via server routes (`/api/prices`, `/api/history`), cached, with a clearly labeled sample fallback
- Progress saved on the device (localStorage); no accounts, no tracking
- Installable as a home-screen web app

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy

Push to GitHub, then import the repo in Vercel. No environment variables are needed.

---

Designed and built by Allen Ford as a product case study.
