// api/store-assets.js — downloads images + PDFs to Vercel Blob via @vercel/blob SDK
import { put } from '@vercel/blob';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 300;

function getExt(url, ct) {
  if (url.match(/\.pdf$/i) || (ct && ct.includes('pdf')))  return '.pdf';
  if (url.match(/\.png$/i) || (ct && ct.includes('png')))  return '.png';
  if (url.match(/\.webp$/i))                               return '.webp';
  return '.jpg';
}

async function downloadFile(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/jpeg,image/png,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://mlg-new-construction.vercel.app/',
      },
    });
    clearTimeout(timer);
    if (!r.ok) return { error: 'HTTP ' + r.status + ' from ' + url };
    const ct  = r.headers.get('content-type') || 'image/jpeg';
    const buf = await r.arrayBuffer();
    return { buf, ct };
  } catch(e) {
    clearTimeout(timer);
    return { error: e.message + ' fetching ' + url };
  }
}

async function uploadToBlob(filename, buf, ct) {
  const token = getBlobToken();
  if (!token) return { error: 'BLOB_READ_WRITE_TOKEN not set — connect a Blob store to this project' };
  try {
    const blob = await put(filename, Buffer.from(buf), {
      access: 'public',
      contentType: ct,
      token,
      addRandomSuffix: true,
    });
    return blob;
  } catch(e) {
    return { error: 'Blob upload error: ' + e.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { buildingId, images = [], pdfs = [] } = req.body || {};
  if (!buildingId) return res.status(400).json({ error: 'buildingId required' });

  const results = { images: [], pdfs: [], errors: [] };
  const prefix  = 'buildings/' + buildingId + '/';

  console.log('[Assets] Starting:', images.length, 'images,', pdfs.length, 'PDFs for', buildingId);
  console.log('[Assets] BLOB_TOKEN set:', !!getBlobToken());

  // Process images one at a time to avoid memory issues
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img.url) { results.errors.push('No URL for image ' + i); continue; }

    const dl = await downloadFile(img.url);
    if (dl.error) {
      console.log('[Assets] Download error:', dl.error);
      results.errors.push(dl.error);
      continue;
    }

    const filename = prefix + 'images/' + String(i).padStart(3, '0') + getExt(img.url, dl.ct);
    const blob = await uploadToBlob(filename, dl.buf, dl.ct);
    if (blob.error) {
      console.log('[Assets] Blob error:', blob.error);
      results.errors.push(blob.error);
      continue;
    }
    console.log('[Assets] ✓ image', i + 1, '/', images.length, '->', blob.url?.substring(0, 60));
    results.images.push({ ...img, url: blob.url, originalUrl: img.url });
  }

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i];
    if (!pdf.url) { results.errors.push('No URL for PDF ' + i); continue; }

    const dl = await downloadFile(pdf.url);
    if (dl.error) {
      console.log('[Assets] PDF download error:', dl.error);
      results.errors.push(dl.error);
      continue;
    }

    const safeName = (pdf.name || 'doc-' + i).replace(/[^a-z0-9._-]/gi, '_');
    const filename = prefix + 'pdfs/' + safeName + '.pdf';
    const blob = await uploadToBlob(filename, dl.buf, 'application/pdf');
    if (blob.error) {
      console.log('[Assets] PDF blob error:', blob.error);
      results.errors.push(blob.error);
      continue;
    }
    console.log('[Assets] ✓ pdf', i + 1, '/', pdfs.length);
    results.pdfs.push({ ...pdf, url: blob.url, originalUrl: pdf.url });
  }

  console.log('[Assets] Done:', results.images.length, 'images,', results.pdfs.length, 'PDFs,', results.errors.length, 'errors');
  if (results.errors.length > 0) console.log('[Assets] First 3 errors:', results.errors.slice(0, 3));
  return res.status(200).json(results);
}
