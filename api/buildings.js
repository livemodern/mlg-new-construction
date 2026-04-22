// api/buildings.js — KV CRUD using Upstash REST API directly (no @vercel/kv package)
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
  return r?.result ?? null;
}

async function kvSet(key, value) {
  return kvRequest('POST', '/set/' + encodeURIComponent(key), [JSON.stringify(value)]);
}

async function kvDel(key) {
  return kvRequest('GET', '/del/' + encodeURIComponent(key));
}

async function kvKeys(pattern) {
  const r = await kvRequest('GET', '/keys/' + encodeURIComponent(pattern));
  return r?.result ?? [];
}

async function kvSadd(key, member) {
  return kvRequest('POST', '/sadd/' + encodeURIComponent(key), [member]);
}

async function kvSrem(key, member) {
  return kvRequest('POST', '/srem/' + encodeURIComponent(key), [member]);
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const raw = await kvGet('building:' + id);
        if (!raw) return res.status(404).json({ error: 'Not found' });
        const building = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return res.status(200).json(building);
      }
      const keys = await kvKeys('building:*');
      const buildings = await Promise.all(
        keys.map(async k => {
          const raw = await kvGet(k);
          if (!raw) return null;
          return typeof raw === 'string' ? JSON.parse(raw) : raw;
        })
      );
      return res.status(200).json(
        buildings.filter(Boolean).sort((a, b) => ((a.suggestedName || a.name || '') + '').localeCompare((b.suggestedName || b.name || '') + ''))
      );
    }

    if (req.method === 'POST') {
      const { id: bid, data } = req.body || {};
      if (!bid || !data) return res.status(400).json({ error: 'id and data required' });
      data.updatedAt = new Date().toISOString();
      if (!data.createdAt) data.createdAt = data.updatedAt;
      await kvSet('building:' + bid, data);
      await kvSadd('building-ids', bid);
      return res.status(200).json({ ok: true, id: bid });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'id required' });
      await kvDel('building:' + id);
      await kvSrem('building-ids', id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Buildings]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
