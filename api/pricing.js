// api/pricing.js — Pricing CRUD using Upstash REST API directly
const https = require('https');

function kvRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(process.env.KV_REST_API_URL + path);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': 'Bearer ' + process.env.KV_REST_API_TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(b); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function kvGet(key) {
  const r = await kvRequest('GET', '/get/' + encodeURIComponent(key));
  const raw = r?.result ?? null;
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function kvSet(key, value) {
  return kvRequest('POST', '/set/' + encodeURIComponent(key), [JSON.stringify(value)]);
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { buildingId, unitId } = req.query;

  try {
    if (req.method === 'GET') {
      if (!buildingId) return res.status(400).json({ error: 'buildingId required' });
      const pricing = await kvGet('pricing:' + buildingId) || [];
      return res.status(200).json(pricing);
    }

    if (req.method === 'POST') {
      const { buildingId: bid, units, unit } = req.body || {};
      if (!bid) return res.status(400).json({ error: 'buildingId required' });

      if (units !== undefined) {
        await kvSet('pricing:' + bid, units);
        if (units.length > 0) {
          const prices = units.map(u => u.price).filter(p => typeof p === 'number' && p > 0).sort((a, b) => a - b);
          if (prices.length > 0) {
            const building = await kvGet('building:' + bid);
            if (building) {
              const fmt = p => '$' + (p >= 1000000 ? (p / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M' : p.toLocaleString());
              building.priceFrom  = prices[0];
              building.priceRange = fmt(prices[0]) + (prices.length > 1 ? ' \u2013 ' + fmt(prices[prices.length - 1]) + '+' : '+');
              building.updatedAt  = new Date().toISOString();
              await kvSet('building:' + bid, building);
            }
          }
        }
        return res.status(200).json({ ok: true, count: units.length });
      }

      if (unit !== undefined) {
        const existing = await kvGet('pricing:' + bid) || [];
        const idx = existing.findIndex(u => u.id === unit.id);
        if (idx >= 0) existing[idx] = unit; else existing.push(unit);
        await kvSet('pricing:' + bid, existing);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'units or unit required' });
    }

    if (req.method === 'DELETE') {
      if (!buildingId || !unitId) return res.status(400).json({ error: 'buildingId and unitId required' });
      const existing = await kvGet('pricing:' + buildingId) || [];
      await kvSet('pricing:' + buildingId, existing.filter(u => u.id !== unitId));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Pricing]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
