# StockIQ — Personal Stock Analysis Platform

> A free, privacy-first stock analysis platform with AI-powered insights, portfolio tracking, market scanning, and investment planning.

---

## 📋 Table of Contents

- [Features](#features)
- [Pages Overview](#pages-overview)
- [Setup Guide](#setup-guide)
- [File Structure](#file-structure)
- [Tech Stack](#tech-stack)
- [Privacy & Security](#privacy--security)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Features

| Feature | Description |
|---|---|
| US Stock Analysis | Real-time price, metrics, chart, dividends, AI analysis + chat |
| Indian Stock Analysis | NSE + BSE support, ₹ denominated, Nifty 50 quick picks |
| Portfolio Tracker | Track holdings, live P&L, allocation charts, AI insights |
| Investment Advisor | Budget + goal input → full AI investment plan with allocations |
| Portfolio Analyzer | Upload CSV → per-stock AI verdict (HOLD/SELL/ADD/REDUCE) |
| Market Scanner | Daily ATH/ATL scanner, big movers, news/macro/war AI brief |
| AI Chat | Multi-turn conversation on any stock after analysis |
| 4 Visual Themes | Dark Professional, Clean Minimal, Bold & Modern, Terminal |

---

## Pages Overview

### `index.html` — US Markets
- Search any US ticker (NYSE/NASDAQ)
- 12 key metrics (Market Cap, P/E, Beta, Revenue, etc.)
- Interactive price chart (1M / 3M / 6M / 1Y)
- Dividend section (yield, ex-date, payout ratio)
- AI analysis via Groq LLM
- Multi-turn AI chat with suggested questions

### `india.html` — India Markets
- NSE (`.NS`) and BSE (`.BO`) support
- Same metrics as US page but ₹ denominated
- Nifty 50 quick picks
- India-specific AI analysis (P/B ratio, sector context)
- Multi-turn AI chat with India-focused suggestions

### `portfolio.html` — Portfolio Tracker
- Add holdings manually (ticker, quantity, avg buy price)
- Supports mixed US + Indian stocks — $ and ₹ tracked separately, never mixed
- Live P&L per holding and portfolio totals
- Allocation pie chart + P&L bar chart
- AI portfolio analysis with actionable suggestions

### `advisor.html` — Investment Advisor
- Input: budget, currency, goal, time horizon, risk level, market preference, sectors
- AI generates complete 8-section investment plan:
  1. Portfolio overview & strategy
  2. Asset allocation percentages
  3. 6–10 specific stock/ETF picks with exact amounts
  4. Diversification analysis
  5. Investment strategy (lump sum vs. SIP/DCA)
  6. Risk management plan
  7. Key metrics to track monthly
  8. 12-month action roadmap
- Follow-up chat with full plan context retained

### `analyzer.html` — Portfolio Analyzer
- 3 input methods: Upload CSV, Enter manually, Paste text
- Fetches live prices for all holdings automatically
- Per-stock verdict table: **STRONG HOLD / HOLD / ADD MORE / REDUCE / SELL**
- Conviction level per stock: HIGH / MEDIUM / LOW
- Deep AI analysis: executive summary, red flags, rebalancing plan, 12-month outlook
- CSV template download included
- Follow-up chat

### `scanner.html` — Market Scanner
- Scans 40 US + 25 Indian stocks (or your custom watchlist)
- Detects: Near ATH (within 5%), big drops (50%+ from 52W high), near ATL
- Today's big movers (±3%+)
- Click any stock → modal with AI buy timing:
  - Buy now / Wait / Accumulate slowly / Avoid
  - Support levels, stop-loss suggestions, risk/reward ratio
- News & Macro Intelligence (4 AI tabs):
  - **Macro & War** — Fed policy, active conflicts, sector impact
  - **Sector Trends** — rotation signals, hot/cold sectors
  - **Opportunities** — value plays, specific tickers looking attractive
  - **Risks to Watch** — crash scenarios, hedging ideas

### `settings.html` — Settings
- Groq API key management (localStorage only, never in code)
- AI model selection (4 models available)
- Theme switcher with live preview
- Data & privacy info
- Clear all local data option

---

## Setup Guide

### Step 1 — Get a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up — free, no credit card needed
3. Go to **API Keys → Create API Key**
4. Copy the key (starts with `gsk_`)
5. Recommended: **Data Controls → Enable Zero Data Retention**

### Step 2 — Run Locally

Just open `index.html` in your browser. No install, no build, no server needed.

With VS Code + Live Server (recommended):
```
1. Install "Live Server" extension in VS Code
2. Right-click index.html → Open with Live Server
```

### Step 3 — Add Your API Key

```
Open site → Settings (navbar) → Paste Groq key → Save Key
```

The key is stored in your browser's localStorage only. Never in any file.

### Step 4 — Deploy to GitHub Pages (Optional)

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stockiq.git
git push -u origin main
```

Then in GitHub: **Settings → Pages → Source: main branch → Save**

Your site will be live at `https://YOUR_USERNAME.github.io/stockiq/`

---

## CSV Format for Portfolio Upload

```csv
Ticker,Quantity,Buy Price,Exchange
AAPL,10,150.00,
TSLA,5,200.00,
RELIANCE,8,2400.00,.NS
TCS,3,3500.00,.NS
HDFCBANK,10,1600.00,.NS
```

- Leave Exchange empty for US stocks
- Use `.NS` for NSE, `.BO` for BSE

---

## File Structure

```
stockiq/
├── index.html       ← US Stocks
├── india.html       ← Indian Stocks (NSE/BSE)
├── portfolio.html   ← Portfolio Tracker
├── advisor.html     ← Investment Advisor
├── analyzer.html    ← Portfolio Analyzer (CSV upload)
├── scanner.html     ← Market Scanner (ATH/ATL/News)
├── settings.html    ← API key, themes, preferences
├── app.js           ← All shared logic
├── style.css        ← All styles + 4 themes
├── LICENSE          ← All Rights Reserved
└── README.md
```

---

## Tech Stack

| Component | Tool | Cost |
|---|---|---|
| Frontend | HTML + CSS + Vanilla JS | Free |
| Stock Data | Yahoo Finance via CORS proxy | Free |
| AI Analysis | Groq API (Llama 3.3 70B / Llama 4 / Qwen3 32B) | Free tier |
| Charts | Chart.js | Free |
| Fonts | IBM Plex Mono + IBM Plex Sans | Free |
| Hosting | GitHub Pages (optional) | Free |

**No backend. No database. No tracking. No subscriptions. Runs 100% in your browser.**

---

## AI Models Available

| Model | Model ID | Best For |
|---|---|---|
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Best quality — recommended |
| Llama 4 Scout | `llama-4-scout-17b-16e-instruct` | Latest Meta model |
| Qwen3 32B | `qwen/qwen3-32b` | Strong reasoning |
| Llama 3.1 8B | `llama-3.1-8b-instant` | Fastest responses |

Switch models anytime in Settings.

---

## Privacy & Security

| Item | How It's Handled |
|---|---|
| Groq API Key | Browser localStorage only. Never in source code. Sent only to Groq directly from your browser. |
| Portfolio Data | Browser localStorage only. Never leaves your device. |
| Stock Queries | Sent directly to Yahoo Finance (public API). No middleman server. |
| AI Queries | Sent directly to Groq. Groq cannot use your data for training by default (contractual). |
| Source Code | Fully readable — no obfuscation, no hidden network calls. |

---

## License

**All Rights Reserved — Private Use Only**

This project uses a custom restrictive license. See the `LICENSE` file for full terms.

In short:
- You may run this for your own personal use
- You may NOT redistribute, copy, sell, or deploy it publicly
- You may NOT use it commercially in any form
- The code and all its contents remain the exclusive property of the author

---

## Disclaimer

StockIQ is for **informational and educational purposes only**.

- AI analysis is not financial advice
- Past performance does not guarantee future results
- Always do your own research (DYOR) before investing
- Not a SEBI-registered or SEC-registered advisor
- Never invest money you cannot afford to lose

---

*Built with ◈ StockIQ*
