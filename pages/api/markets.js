export const config = {
  api: { bodyParser: false }
};

const CACHE_MS = parseInt(process.env.CACHE_MS || '60000', 10);
const caches = new Map();
const ALLOWED = new Set(['usd', 'krw']);

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const vs = String((req.query.vs || 'usd')).toLowerCase();
    if (!ALLOWED.has(vs)) {
      return res.status(400).json({ error: `Invalid currency: ${vs}. Use one of: usd, krw` });
    }

    const now = Date.now();
    const entry = caches.get(vs);
    if (entry && entry.data && now - entry.ts < CACHE_MS) {
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ vs, source: 'cache', lastUpdated: new Date(entry.ts).toISOString(), items: entry.data });
    }

    const params = new URLSearchParams({
      vs_currency: vs,
      order: 'market_cap_desc',
      per_page: '30',
      page: '1',
      price_change_percentage: '24h'
    });
    const url = `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;

    const headers = {};
    if (process.env.COINGECKO_API_KEY) headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;

    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: `CoinGecko error ${resp.status}: ${resp.statusText}`, details: text.slice(0, 500) });
    }
    const raw = await resp.json();
    const items = (raw || []).map((r, idx) => ({
      rank: r.market_cap_rank ?? idx + 1,
      id: r.id,
      name: r.name,
      symbol: (r.symbol || '').toUpperCase(),
      image: r.image,
      price: r.current_price,
      market_cap: r.market_cap,
      change_24h: r.price_change_percentage_24h
    }));

    caches.set(vs, { ts: now, data: items });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ vs, source: 'live', lastUpdated: new Date(now).toISOString(), items });
  } catch (err) {
    console.error('API error:', err?.message || err);
    return res.status(502).json({ error: 'Upstream fetch failed', details: String(err?.message || err) });
  }
}

