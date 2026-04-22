// api/buildings.js — KV CRUD using fetch() + Upstash REST API
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { id } = req.query;
  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  const kv = {
    get: async (key) => {
      const r = await fetch(KV_URL + '/get/' + encodeURIComponent(key), { headers: { Authorization: 'Bearer ' + KV_TOKEN } });
      const j = await r.json();
      const raw = j?.result ?? null;
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    },
    set: async (key, value) => {
      const r = await fetch(KV_URL + '/set/' + encodeURIComponent(key), { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify([JSON.stringify(value)]) });
      return r.json();
    },
    del: async (key) => {
      const r = await fetch(KV_URL + '/del/' + encodeURIComponent(key), { headers: { Authorization: 'Bearer ' + KV_TOKEN } });
      return r.json();
    },
    keys: async (pattern) => {
      const r = await fetch(KV_URL + '/keys/' + encodeURIComponent(pattern), { headers: { Authorization: 'Bearer ' + KV_TOKEN } });
      const j = await r.json();
      return j?.result ?? [];
    },
    sadd: async (key, member) => {
      const r = await fetch(KV_URL + '/sadd/' + encodeURIComponent(key), { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify([member]) });
      return r.json();
    },
    srem: async (key, member) => {
      const r = await fetch(KV_URL + '/srem/' + encodeURIComponent(key), { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify([member]) });
      return r.json();
    },
  };

  try {
    if (req.method === 'GET') {
      if (id) {
        const building = await kv.get('building:' + id);
        if (!building) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(building);
      }
      const keys = await kv.keys('building:*');
      const buildings = await Promise.all(keys.map(k => kv.get(k)));
      return res.status(200).json(
        buildings.filter(Boolean).sort((a, b) => ((a.suggestedName || a.name || '') + '').localeCompare((b.suggestedName || b.name || '') + ''))
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
  } catch (err) {
    console.error('[Buildings]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
