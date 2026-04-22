// api/store-assets.js — using fetch() for downloads + Blob REST API uploads
export const maxDuration = 300;

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
  const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

  const uploadToBlob = async (filename, buffer, contentType) => {
    const r = await fetch('https://blob.vercel-storage.com/' + filename, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + BLOB_TOKEN, 'Content-Type': contentType, 'x-content-type': contentType },
      body: buffer,
    });
    return r.json();
  };

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    try {
      const dl = await fetch(img.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      if (!dl.ok) { results.errors.push('Download failed ' + dl.status + ': ' + img.url); continue; }
      const ct  = dl.headers.get('content-type') || 'image/jpeg';
      const buf = await dl.arrayBuffer();
      const filename = prefix + 'images/' + String(i).padStart(3, '0') + getExt(img.url, ct);
      const blob = await uploadToBlob(filename, buf, ct);
      if (blob.url) {
        results.images.push({ ...img, url: blob.url, originalUrl: img.url });
        console.log('[Assets] image', i+1, '/', images.length);
      } else {
        results.errors.push('Blob upload failed: ' + JSON.stringify(blob).substring(0,100));
      }
    } catch (e) { results.errors.push(img.url + ': ' + e.message); }
  }

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i];
    try {
      const dl = await fetch(pdf.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
      if (!dl.ok) { results.errors.push('Download failed ' + dl.status + ': ' + pdf.url); continue; }
      const buf      = await dl.arrayBuffer();
      const safeName = (pdf.name || 'doc-' + i).replace(/[^a-z0-9._-]/gi, '_');
      const filename = prefix + 'pdfs/' + safeName + '.pdf';
      const blob = await uploadToBlob(filename, buf, 'application/pdf');
      if (blob.url) {
        results.pdfs.push({ ...pdf, url: blob.url, originalUrl: pdf.url });
        console.log('[Assets] pdf', i+1, '/', pdfs.length);
      } else {
        results.errors.push('Blob upload failed for PDF: ' + JSON.stringify(blob).substring(0,100));
      }
    } catch (e) { results.errors.push((pdf.url||'unknown') + ': ' + e.message); }
  }

  console.log('[Assets] Done —', results.images.length, 'images,', results.pdfs.length, 'PDFs,', results.errors.length, 'errors');
  return res.status(200).json(results);
}
