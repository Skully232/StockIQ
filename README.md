# StockIQ — Personal Stock Analysis Website

A free, privacy-first stock analysis tool with AI-powered insights.

## Features
- **US Stocks** — Real-time price, metrics, charts, dividends, AI analysis
- **Indian Stocks** — NSE + BSE via Yahoo Finance (`.NS` / `.BO` suffixes)
- **Portfolio Tracker** — Track holdings, P&L, allocation charts, AI insights
- **4 Visual Themes** — Dark, Light, Bold, Terminal — switchable anytime
- **AI Analysis** — Powered by Groq (free tier, Llama 3.3 70B, Llama 4, Qwen)

## Setup

### 1. Get a Free Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Go to **API Keys → Create API Key**
4. Optional: **Data Controls → Enable Zero Data Retention**

### 2. Open the Site
Just open `index.html` in your browser — no server needed.

Or for GitHub Pages:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stock-analyzer.git
git push -u origin main
```
Then enable GitHub Pages in repo Settings → Pages → main branch.

### 3. Add Your API Key
Open the site → Go to **Settings** → Paste your Groq key → Save.

Your key is stored in your browser's `localStorage` only — never in code, never on any server.

## Privacy
- API key: stored only in your browser's localStorage
- Portfolio data: stored only in your browser's localStorage  
- No backend, no database, no tracking
- Stock data fetched directly from Yahoo Finance (public API)
- AI queries go directly from your browser to Groq

## File Structure
```
my-stock-analyzer/
├── index.html      ← US Stocks page
├── india.html      ← Indian Stocks (NSE + BSE)
├── portfolio.html  ← Portfolio tracker
├── settings.html   ← API key, theme, preferences
├── style.css       ← All styles + 4 themes
├── app.js          ← All shared logic
└── README.md
```

## Data Sources
- **Yahoo Finance** — Free, no API key needed, real-time data
- **Groq** — Free AI inference (Llama 3.3 70B, Llama 4, Qwen QwQ 32B)

## Not Financial Advice
This tool is for informational purposes only. Always do your own research.
