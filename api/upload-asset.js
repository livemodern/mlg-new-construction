// api/upload-asset.js
// Generic file upload to Vercel Blob.
// Headers: x-building-id, x-asset-kind ("floorplan" | "rendering" | "brokerdoc"), x-filename
// Body: raw file bytes
// Returns: { url, filename, kind, contentType }
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
  const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

  if (!buildingId)  return res.status(400).json({ error: 'x-building-id required' });
  if (!BLOB_TOKEN)  return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });

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
    const blobPath    = 'buildings/' + buildingId + '/' + subfolder + '/' + Date.now() + '-' + filename;

    const blobRes = await fetch('https://blob.vercel-storage.com/' + blobPath, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + BLOB_TOKEN,
        'Content-Type':  contentType,
        'x-content-type': contentType,
      },
      body: buf,
    });
    const blobData = await blobRes.json();
    if (!blobRes.ok) {
      return res.status(500).json({ error: 'Blob HTTP ' + blobRes.status + ': ' + JSON.stringify(blobData).substring(0, 200) });
    }

    return res.status(200).json({
      url:        blobData.url,
      filename,
      kind,
      contentType,
      sizeBytes:  buf.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
