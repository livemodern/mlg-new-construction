// api/buildings.js — KV CRUD for building profiles
// GET  /api/buildings        → list all
// GET  /api/buildings?id=X   → single building
// POST /api/buildings        → create/update { id, data }
// DELETE /api/buildings?id=X → delete
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (id) {
      const b = await kv.get('building:' + id);
      if (!b) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(b);
    }
    const keys = await kv.keys('building:*');
    const all  = await Promise.all(keys.map(k => kv.get(k)));
    return res.status(200).json(
      all.filter(Boolean).sort((a, b) => (a.suggestedName || '').localeCompare(b.suggestedName || ''))
    );
  }

  if (req.method === 'POST') {
    const { id: bid, data } = req.body || {};
    if (!bid || !data) return res.status(400).json({ error: 'id and data required' });
    data.updatedAt = new Date().toISOString();
    if (!data.createdAt) data.createdAt = data.updatedAt;
    await kv.set('building:' + bid, data);
    await kv.sadd('building-ids', bid);
    return res.status(200).json({ ok: true, id: bid });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'id required' });
    await kv.del('building:' + id);
    await kv.srem('building-ids', id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
