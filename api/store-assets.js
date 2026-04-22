// api/store-assets.js
// Downloads selected images + PDFs to Vercel Blob — nothing hotlinked
export const maxDuration = 300;
const https = require('https');
const http  = require('http');
const { put } = require('@vercel/blob');

async function downloadBuffer(url) {
  return new Promise((resolve) => {
    try {
      const p = new URL(url);
      const mod = p.protocol === 'https:' ? https : http;
      const req = mod.request({
        hostname: p.hostname,
        path: p.pathname + (p.search || ''),
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': p.origin },
        timeout: 15000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadBuffer(res.headers.location).then(resolve); return;
        }
        if (!res.statusCode || res.statusCode >= 400) { resolve(null); return; }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'application/octet-stream' }));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch { resolve(null); }
  });
}

function getExt(url, ct) {
  if (url.match(/\.pdf$/i) || ct?.includes('pdf'))  return '.pdf';
  if (url.match(/\.png$/i) || ct?.includes('png'))  return '.png';
  if (url.match(/\.webp$/i))                        return '.webp';
  return '.jpg';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { buildingId, images = [], pdfs = [] } = req.body || {};
  if (!buildingId) return res.status(400).json({ error: 'buildingId required' });

  const results = { images: [], pdfs: [], errors: [] };
  const prefix  = 'buildings/' + buildingId + '/';

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    try {
      const dl = await downloadBuffer(img.url);
      if (!dl) { results.errors.push('Download failed: ' + img.url); continue; }
      const filename = prefix + 'images/' + String(i).padStart(3, '0') + getExt(img.url, dl.contentType);
      const blob = await put(filename, dl.buffer, { access: 'public', contentType: dl.contentType });
      results.images.push({ ...img, url: blob.url, originalUrl: img.url });
      console.log('[Assets] image', i + 1, '/', images.length, blob.url);
    } catch (e) { results.errors.push(img.url + ': ' + e.message); }
  }

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i];
    try {
      const dl = await downloadBuffer(pdf.url);
      if (!dl) { results.errors.push('Download failed: ' + pdf.url); continue; }
      const safeName = (pdf.name || 'doc-' + i).replace(/[^a-z0-9._-]/gi, '_');
      const filename = prefix + 'pdfs/' + safeName + '.pdf';
      const blob = await put(filename, dl.buffer, { access: 'public', contentType: 'application/pdf' });
      results.pdfs.push({ ...pdf, url: blob.url, originalUrl: pdf.url });
      console.log('[Assets] pdf', i + 1, '/', pdfs.length, blob.url);
    } catch (e) { results.errors.push((pdf.url || 'unknown') + ': ' + e.message); }
  }

  console.log('[Assets] Done —', results.images.length, 'images,', results.pdfs.length, 'PDFs,', results.errors.length, 'errors');
  return res.status(200).json(results);
}
