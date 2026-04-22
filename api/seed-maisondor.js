// api/seed-maisondor.js — one-time endpoint to restore maisondor from static data
// DELETE this file after use
import maisondor from '../src/data/maisondor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  try {
    const data = { ...maisondor, id: 'maisondor', updatedAt: new Date().toISOString() };

    const r = await fetch(KV_URL + '/set/' + encodeURIComponent('building:maisondor'), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await r.json();

    // Also add to the index
    await fetch(KV_URL + '/sadd/' + encodeURIComponent('building-ids'), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(['maisondor']),
    });

    return res.status(200).json({
      ok: true,
      name: data.name,
      renderings: data.renderings?.length,
      keyFacts: data.keyFacts?.length,
      kvResult: result,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
