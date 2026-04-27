// api/upload-asset.js
// Generic file upload to Vercel Blob via the official @vercel/blob SDK.
// Headers: x-building-id, x-asset-kind ("floorplan" | "rendering" | "brokerdoc"), x-filename
// Body: raw file bytes
// Returns: { url, filename, kind, contentType }
import { put } from '@vercel/blob';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 60;

export const config = {
  api: { bodyParser: false }, // we read raw bytes
};

function safeName(name) {
  return (name || ('asset-' + Date.now())).replace(/[^a-z0-9._-]/gi, '_');
}

function inferContentType(filename, fallback) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf')                      return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg')    return 'image/jpeg';
  if (ext === 'png')                      return 'image/png';
  if (ext === 'webp')                     return 'image/webp';
  if (ext === 'gif')                      return 'image/gif';
  return fallback || 'application/octet-stream';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const buildingId = req.headers['x-building-id'];
  const kind       = (req.headers['x-asset-kind'] || 'asset').toLowerCase();
  const filename   = safeName(req.headers['x-filename']);
  const BLOB_TOKEN = getBlobToken();

  if (!buildingId)  return res.status(400).json({ error: 'x-building-id required' });
  if (!BLOB_TOKEN)  return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured. Make sure the Blob store is connected to this Vercel project and the deployment has been refreshed.' });

  const validKinds = ['floorplan', 'rendering', 'brokerdoc'];
  if (!validKinds.includes(kind)) {
    return res.status(400).json({ error: 'x-asset-kind must be one of: ' + validKinds.join(', ') });
  }

  const folderMap = { floorplan: 'floorplans', rendering: 'renderings', brokerdoc: 'pdfs' };
  const subfolder = folderMap[kind];

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);

    if (buf.length === 0) return res.status(400).json({ error: 'Empty body' });
    if (buf.length > 50 * 1024 * 1024) return res.status(413).json({ error: 'File too large (max 50MB)' });

    const contentType = inferContentType(filename, req.headers['content-type']);
    const blobPath    = 'buildings/' + buildingId + '/' + subfolder + '/' + filename;

    const blob = await put(blobPath, buf, {
      access: 'public',
      contentType,
      token: BLOB_TOKEN,
      addRandomSuffix: true, // avoid collisions if same filename uploaded twice
    });

    return res.status(200).json({
      url:        blob.url,
      filename,
      kind,
      contentType,
      sizeBytes:  buf.length,
    });
  } catch (err) {
    // Surface useful detail. The SDK throws helpful messages for store-config mismatches.
    return res.status(500).json({
      error:    err.message || 'Upload failed',
      hint:     /private store/i.test(err.message || '')
        ? 'Your Vercel Blob store is set to private access. Switch it to public in the Vercel dashboard so the app can display images and PDFs without auth.'
        : undefined,
    });
  }
}

