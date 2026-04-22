// api/dropbox-import.js — ingest files from Dropbox or Google Drive public folder
export const maxDuration = 120;
const https = require('https');
const http  = require('http');

async function fetchHtml(url) {
  return new Promise((resolve) => {
    try {
      const p = new URL(url);
      const mod = p.protocol === 'https:' ? https : http;
      const req = mod.request({
        hostname: p.hostname,
        path: p.pathname + (p.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,*/*',
        },
        timeout: 15000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { fetchHtml(res.headers.location).then(resolve); return; }
        let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(b));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch { resolve(null); }
  });
}

function parseDropbox(html, folderUrl) {
  const files = [];
  const base = folderUrl.split('?')[0];
  for (const m of html.matchAll(/"filename"\s*:\s*"([^"]+\.(?:pdf|jpg|jpeg|png|webp))"/gi)) {
    const name   = m[1];
    const ext    = name.split('.').pop().toLowerCase();
    const dlUrl  = base + '/' + encodeURIComponent(name) + '?dl=1';
    files.push({ name, url: dlUrl, type: ext === 'pdf' ? 'pdf' : 'image' });
  }
  if (!files.length) {
    for (const m of html.matchAll(/href="(https:\/\/www\.dropbox\.com\/[^"]+\.(?:pdf|jpg|jpeg|png|webp)[^"]*?)"/gi)) {
      const raw  = m[1].replace(/\?.*$/, '') + '?dl=1';
      const name = decodeURIComponent(raw.split('/').pop().split('?')[0]);
      const ext  = name.split('.').pop().toLowerCase();
      files.push({ name, url: raw, type: ext === 'pdf' ? 'pdf' : 'image' });
    }
  }
  return [...new Map(files.map(f => [f.name, f])).values()];
}

function parseGoogleDrive(html) {
  const files = [];
  for (const m of html.matchAll(/"([0-9A-Za-z_-]{25,})"[^\]]*?"([^"]+\.(?:pdf|jpg|jpeg|png|webp))"/gi)) {
    const id  = m[1];
    const name = m[2];
    const ext  = name.split('.').pop().toLowerCase();
    files.push({ name, url: 'https://drive.google.com/uc?export=download&id=' + id, type: ext === 'pdf' ? 'pdf' : 'image' });
  }
  return [...new Map(files.map(f => [f.url, f])).values()];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { folderUrl } = req.body || {};
  if (!folderUrl) return res.status(400).json({ error: 'folderUrl required' });

  try {
    const html = await fetchHtml(folderUrl);
    if (!html) return res.status(400).json({ error: 'Could not fetch folder URL' });

    let files = [];
    if (folderUrl.includes('dropbox.com'))      files = parseDropbox(html, folderUrl);
    else if (folderUrl.includes('drive.google')) files = parseGoogleDrive(html);
    else return res.status(400).json({ error: 'Only Dropbox and Google Drive URLs supported' });

    console.log('[DropboxImport] Found', files.length, 'files');
    const pdfs   = files.filter(f => f.type === 'pdf');
    const images = files.filter(f => f.type === 'image');
    return res.status(200).json({ files, pdfs, images, count: files.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
