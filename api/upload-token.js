// api/upload-token.js
// Issues short-lived signed tokens for direct browser-to-Blob uploads.
// The browser library `@vercel/blob/client`'s `upload()` calls this endpoint
// to get a token, then uploads file bytes DIRECTLY to Blob storage.
// The actual file bytes never pass through this serverless function, so we
// don't hit Vercel's 4.5 MB body limit (relevant for 15 MB+ rendering files).

import { handleUpload } from '@vercel/blob/client';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const TOKEN = getBlobToken();
  if (!TOKEN) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });

  try {
    // Read the JSON body manually (Vercel runtimes vary on bodyParser presence)
    let body = req.body;
    if (!body || typeof body === 'string') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8');
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    }

    const result = await handleUpload({
      body,
      request: req,
      token: TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate before issuing a token. clientPayload carries our metadata.
        let payload = {};
        try { payload = clientPayload ? JSON.parse(clientPayload) : {}; } catch {}
        if (!payload.buildingId) throw new Error('buildingId required in clientPayload');

        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'application/pdf',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB hard cap, generous for renderings
          tokenPayload: clientPayload,
          addRandomSuffix: true, // collision-safe filenames
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Hook for post-upload logging or DB writes if needed later.
        // We don't update KV here because the front-end still owns the building
        // record and will save it explicitly when the user clicks "Save Changes".
        console.log('[UploadToken] Completed:', blob.url);
      },
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[UploadToken] Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
}
