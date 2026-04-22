// api/pricing.js — KV pricing management, replaceable inventory
// GET  /api/pricing?buildingId=X           → all units
// POST /api/pricing { buildingId, units }  → REPLACE all pricing
// POST /api/pricing { buildingId, unit }   → add/update single unit
// DELETE /api/pricing?buildingId=X&unitId=Y → remove unit
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { buildingId, unitId } = req.query;

  if (req.method === 'GET') {
    if (!buildingId) return res.status(400).json({ error: 'buildingId required' });
    const pricing = await kv.get('pricing:' + buildingId) || [];
    return res.status(200).json(pricing);
  }

  if (req.method === 'POST') {
    const { buildingId: bid, units, unit } = req.body || {};
    if (!bid) return res.status(400).json({ error: 'buildingId required' });

    if (units !== undefined) {
      await kv.set('pricing:' + bid, units);
      if (units.length > 0) {
        const prices = units.map(u => u.price).filter(p => typeof p === 'number' && p > 0).sort((a, b) => a - b);
        if (prices.length > 0) {
          const building = await kv.get('building:' + bid);
          if (building) {
            const fmt = p => '$' + (p >= 1000000 ? (p / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M' : p.toLocaleString());
            building.priceFrom  = prices[0];
            building.priceRange = fmt(prices[0]) + (prices.length > 1 ? ' \u2013 ' + fmt(prices[prices.length - 1]) + '+' : '+');
            building.updatedAt  = new Date().toISOString();
            await kv.set('building:' + bid, building);
          }
        }
      }
      return res.status(200).json({ ok: true, count: units.length });
    }

    if (unit !== undefined) {
      const existing = await kv.get('pricing:' + bid) || [];
      const idx = existing.findIndex(u => u.id === unit.id);
      if (idx >= 0) existing[idx] = unit; else existing.push(unit);
      await kv.set('pricing:' + bid, existing);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'units or unit required' });
  }

  if (req.method === 'DELETE') {
    if (!buildingId || !unitId) return res.status(400).json({ error: 'buildingId and unitId required' });
    const existing = await kv.get('pricing:' + buildingId) || [];
    await kv.set('pricing:' + buildingId, existing.filter(u => u.id !== unitId));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
