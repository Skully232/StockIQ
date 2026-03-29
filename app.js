// ============================================================
// StockIQ — app.js
// Shared logic: stock data fetching, Groq AI, theme engine,
// utilities, prompt builders
// ============================================================

// ─── UTILITY FUNCTIONS ──────────────────────────────────────

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setVisible(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  if (visible) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

function formatBig(num, prefix = '') {
  if (!num || isNaN(num)) return '—';
  if (num >= 1e12) return prefix + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9)  return prefix + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6)  return prefix + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3)  return prefix + (num / 1e3).toFixed(1) + 'K';
  return prefix + num.toFixed(2);
}

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\d+\. (.*$)/gm, '<div class="ai-list-item num">$1</div>')
    .replace(/^[-•] (.*$)/gm, '<div class="ai-list-item">$1</div>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|d|p])(.*)/gm, (match) => match ? match : '')
    .replace(/(<div class="ai-list)/g, '</p><$1')
    .replace(/(<\/div>\n?)(<p>)/g, '$1$2')
    .trim();
}

// ─── THEME ENGINE ────────────────────────────────────────────

const THEMES = ['dark', 'light', 'bold', 'terminal'];

function initTheme() {
  const saved = localStorage.getItem('stockiq_theme') || 'dark';
  setTheme(saved);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('stockiq_theme', theme);
}

function cycleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const idx = THEMES.indexOf(current);
  const next = THEMES[(idx + 1) % THEMES.length];
  setTheme(next);
  showThemeToast(next);
}

function showThemeToast(theme) {
  let toast = document.getElementById('themeToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'themeToast';
    toast.className = 'theme-toast';
    document.body.appendChild(toast);
  }
  const names = { dark: 'Dark Professional', light: 'Clean Minimal', bold: 'Bold & Modern', terminal: 'Terminal' };
  toast.textContent = '◐ ' + (names[theme] || theme);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// Auto-migrate deprecated model IDs saved in localStorage
(function() {
  const deprecated = { 'qwen-qwq-32b': 'qwen/qwen3-32b', 'mixtral-8x7b-32768': 'llama-3.1-8b-instant' };
  const saved = localStorage.getItem('groq_model');
  if (saved && deprecated[saved]) localStorage.setItem('groq_model', deprecated[saved]);
})();

// Auto-init theme as soon as app.js loads
(function() {
  const saved = localStorage.getItem('stockiq_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

// ─── STOCK DATA FETCHING ──────────────────────────────────────

// Proxy strategy: try multiple CORS proxies with different URL formats
const CORS_PROXIES = [
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

async function fetchWithProxy(url) {
  const errors = [];
  for (const makeProxy of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxy(url);
      const res = await fetch(proxyUrl, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const text = await res.text();
        // Make sure we got actual JSON, not an error HTML page
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          return JSON.parse(text);
        }
      }
    } catch(e) {
      errors.push(e.message);
      continue;
    }
  }
  throw new Error('Could not reach Yahoo Finance. Try disabling VPN or ad-blocker, or check internet.');
}

async function fetchStockData(ticker, currency = 'USD') {
  // Use v8 quote endpoint — more reliable, simpler structure
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false`;
  const chartJson = await fetchWithProxy(url);

  const meta = chartJson?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data found for "${ticker}". Check the ticker symbol.`);

  // Also fetch summary for fundamentals
  let summaryJson = null;
  try {
    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,defaultKeyStatistics,financialData`;
    summaryJson = await fetchWithProxy(summaryUrl);
  } catch(e) {
    // If summary fails, we still have chart meta data
    console.warn('Summary fetch failed, using chart data only:', e.message);
  }

  const result = summaryJson?.quoteSummary?.result?.[0];
  const price = result?.price || {};
  const summary = result?.summaryDetail || {};
  const stats = result?.defaultKeyStatistics || {};
  const fin = result?.financialData || {};
  const raw = v => v?.raw ?? null;

  const json = { quoteSummary: { result: [{ price, summaryDetail: summary, defaultKeyStatistics: stats, financialData: fin }] } };

  // Use meta from chart as fallback for price data
  return {
    ticker,
    name: price.longName || price.shortName || meta.longName || meta.shortName || ticker,
    exchange: price.exchangeName || meta.exchangeName || '',
    sector: price.sector || '',
    currency: price.currency || meta.currency || currency,
    price: raw(price.regularMarketPrice) ?? meta.regularMarketPrice,
    change: raw(price.regularMarketChange) ?? (meta.regularMarketPrice - meta.previousClose),
    changePct: raw(price.regularMarketChangePercent) != null
      ? raw(price.regularMarketChangePercent) * 100
      : ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100),
    marketCap: raw(price.marketCap),
    volume: raw(price.regularMarketVolume) ?? meta.regularMarketVolume,
    avgVolume: raw(summary.averageVolume),
    high52: raw(summary.fiftyTwoWeekHigh) ?? meta.fiftyTwoWeekHigh,
    low52: raw(summary.fiftyTwoWeekLow) ?? meta.fiftyTwoWeekLow,
    pe: raw(summary.trailingPE),
    eps: raw(stats.trailingEps),
    beta: raw(summary.beta),
    divYield: raw(summary.dividendYield) ? raw(summary.dividendYield) * 100 : null,
    annualDiv: raw(summary.dividendRate),
    exDate: summary.exDividendDate?.fmt || null,
    payDate: summary.dividendDate?.fmt || null,
    payoutRatio: raw(summary.payoutRatio),
    fiveYearYield: raw(stats.fiveYearAverageReturn) ? raw(stats.fiveYearAverageReturn) * 100 : null,
    revenue: raw(fin.totalRevenue),
    profitMargin: raw(fin.profitMargins),
    debtEquity: raw(fin.debtToEquity),
    bookValue: raw(stats.bookValue),
    pbRatio: raw(stats.priceToBook),
    faceValue: null, // Not available via Yahoo
  };
}

async function fetchPriceHistory(ticker, range = '1mo') {
  const intervalMap = { '1mo': '1d', '3mo': '1d', '6mo': '1wk', '1y': '1wk' };
  const interval = intervalMap[range] || '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
  const json = await fetchWithProxy(url);

  const chart = json.chart?.result?.[0];
  if (!chart) throw new Error('No chart data available.');

  const timestamps = chart.timestamp || [];
  const closes = chart.indicators?.quote?.[0]?.close || [];

  const dates = timestamps.map(ts => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const filtered = dates.map((d, i) => ({ date: d, price: closes[i] })).filter(x => x.price != null);

  return {
    dates: filtered.map(x => x.date),
    prices: filtered.map(x => x.price),
  };
}

// ─── GROQ AI (SINGLE TURN) ───────────────────────────────────

async function callGroq(apiKey, model, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial analyst with deep expertise in equity research, fundamental analysis, and portfolio management. Provide insightful, data-driven analysis. Use markdown formatting with bold headers. Be concise and professional. Never give direct buy/sell recommendations — focus on analysis and data.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('Invalid API key. Check your Groq API key in Settings.');
    if (res.status === 429) throw new Error('Rate limit reached. Try again in a moment.');
    throw new Error(err.error?.message || `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response from AI.';
}

// ─── GROQ AI (MULTI-TURN CHAT) ────────────────────────────────

async function callGroqChat(apiKey, model, systemPrompt, history) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-12) // Keep last 12 messages to stay within context
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model: model || 'llama-3.3-70b-versatile', messages, max_tokens: 800, temperature: 0.4 })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('Invalid API key.');
    if (res.status === 429) throw new Error('Rate limit reached. Wait a moment.');
    throw new Error(err.error?.message || `Groq error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response.';
}

// ─── PROMPT BUILDERS ─────────────────────────────────────────

function buildUSPrompt(d) {
  return `You are a professional stock analyst. Analyze ${d.ticker} (${d.name}) based on the following real-time data:

**Price Data:**
- Current Price: $${d.price?.toFixed(2) || 'N/A'}
- Daily Change: ${d.change !== null ? (d.change >= 0 ? '+' : '') + d.change?.toFixed(2) + ' (' + d.changePct?.toFixed(2) + '%)' : 'N/A'}
- 52-Week Range: $${d.low52?.toFixed(2)} – $${d.high52?.toFixed(2)}

**Valuation:**
- Market Cap: ${formatBig(d.marketCap, '$')}
- P/E Ratio: ${d.pe?.toFixed(2) || 'N/A'}
- EPS (TTM): $${d.eps?.toFixed(2) || 'N/A'}
- Beta: ${d.beta?.toFixed(2) || 'N/A'}

**Financials:**
- Revenue (TTM): ${formatBig(d.revenue, '$')}
- Profit Margin: ${d.profitMargin ? (d.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
- Debt/Equity: ${d.debtEquity?.toFixed(2) || 'N/A'}

**Dividends:**
- Yield: ${d.divYield ? d.divYield.toFixed(2) + '%' : 'None'}
- Annual Dividend: ${d.annualDiv ? '$' + d.annualDiv.toFixed(2) : 'None'}
- Payout Ratio: ${d.payoutRatio ? (d.payoutRatio * 100).toFixed(1) + '%' : 'N/A'}

Provide a concise professional analysis covering:
1. **Valuation** — Overvalued, undervalued, or fair?
2. **Momentum & Risk** — Beta, price action, volatility
3. **Financial Health** — Revenue, margins, debt
4. **Income Potential** — Dividend assessment
5. **Bull & Bear Case** — 2-3 sentences each

Keep it under 400 words. Professional tone. No direct buy/sell advice.`;
}

function buildINPrompt(d) {
  return `You are a professional equity analyst specializing in Indian markets (NSE/BSE). Analyze ${d.ticker} (${d.name}) based on the following real-time data:

**Price Data:**
- Current Price: ₹${d.price?.toFixed(2) || 'N/A'}
- Daily Change: ${d.change !== null ? (d.change >= 0 ? '+' : '') + d.change?.toFixed(2) + ' (' + d.changePct?.toFixed(2) + '%)' : 'N/A'}
- 52-Week Range: ₹${d.low52?.toFixed(2)} – ₹${d.high52?.toFixed(2)}

**Valuation:**
- Market Cap: ${formatBig(d.marketCap, '₹')}
- P/E Ratio: ${d.pe?.toFixed(2) || 'N/A'}
- P/B Ratio: ${d.pbRatio?.toFixed(2) || 'N/A'}
- EPS (TTM): ₹${d.eps?.toFixed(2) || 'N/A'}
- Beta: ${d.beta?.toFixed(2) || 'N/A'}

**Financials:**
- Revenue (TTM): ${formatBig(d.revenue, '₹')}
- Profit Margin: ${d.profitMargin ? (d.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
- Book Value: ₹${d.bookValue?.toFixed(2) || 'N/A'}

**Dividends:**
- Yield: ${d.divYield ? d.divYield.toFixed(2) + '%' : 'None'}
- Annual Dividend: ${d.annualDiv ? '₹' + d.annualDiv.toFixed(2) : 'None'}

Provide concise analysis:
1. **Valuation** — Is it fairly valued relative to Indian market peers?
2. **Risk Profile** — Beta, sector exposure, macro sensitivity
3. **Financial Quality** — Revenue growth, margins, balance sheet
4. **Dividend** — Income potential for Indian investors
5. **Bull & Bear Case** — Specific to Indian market context

Keep it under 400 words. Reference Indian market context where relevant.`;
}
