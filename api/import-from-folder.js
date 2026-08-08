import { requireNcAuth } from './_auth.js';
// api/import-from-folder.js
// Take a Drive folder URL, enumerate it, download each file,
// classify it via filename heuristics + AI for ambiguous PDFs, upload to Blob,
// return categorized arrays for the caller to merge into the building record.
import { put } from '@vercel/blob';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 300;

async function fetchAsBuffer(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error('Fetch ' + r.status + ' for ' + url);
  return { buf: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get('content-type') || '' };
}

async function uploadToBlob(buildingId, kind, filename, buf, contentType) {
  const TOKEN = getBlobToken();
  if (!TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN missing — make sure the Blob store is connected to this Vercel project');
  const folderMap = { floorplan: 'floorplans', rendering: 'renderings', brokerdoc: 'pdfs', pricing: 'pricing' };
  const safeName = filename.replace(/[^a-z0-9._-]/gi, '_');
  const path = 'buildings/' + buildingId + '/' + (folderMap[kind] || 'other') + '/' + safeName;
  const blob = await put(path, buf, {
    access: 'public',
    contentType,
    token: TOKEN,
    addRandomSuffix: true,
  });
  return blob.url;
}

// Heuristic categorization based on filename. Returns kind or null if uncertain.
function categorizeByName(name) {
  const n = name.toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/i.test(n)) {
    if (/floor.?plan|floorplate|tier|residence.?\d|unit.?\d|lake.?home/i.test(n)) return 'floorplan';
    return 'rendering';
  }
  if (!/\.pdf$/i.test(n)) return null;
  if (/floor.?plan|floorplate|tier|residence.?\d|unit.?\d|lake.?home/i.test(n)) return 'floorplan';
  if (/price|pricing|cost|availabilit|rate.?sheet/i.test(n)) return 'pricing';
  if (/brochure|fact.?sheet|features|spec|amenit|services|map|location|guide|presentation|book|deck/i.test(n)) return 'brokerdoc';
  return null; // ambiguous
}

// AI fallback for ambiguous PDFs: ask Claude to classify based on filename + first-page bytes.
async function classifyWithAI(filename, pdfBase64) {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return 'brokerdoc'; // safe default if no key
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: 'Classify this real estate PDF into ONE category. Reply with only the single word, no other text:\n- floorplan (a unit floor plan diagram)\n- pricing (a price sheet or availability list with units and prices)\n- brokerdoc (brochure, fact sheet, services, map, amenities, anything else)\n\nFilename: ' + filename }
          ]
        }],
      }),
      signal: AbortSignal.timeout(45000),
    });
    const j = await r.json();
    const text = (j?.content?.[0]?.text || '').trim().toLowerCase();
    if (text.startsWith('floorplan')) return 'floorplan';
    if (text.startsWith('pricing'))   return 'pricing';
    return 'brokerdoc';
  } catch (e) {
    console.warn('[Import] AI classify failed:', e.message);
    return 'brokerdoc';
  }
}

// Extract pricing units from a price-sheet PDF.
async function extractPricing(pdfBase64) {
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return [];
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: 'Extract every priced unit from this real estate price sheet. Return ONLY a JSON array, no other text, no <cite> tags:\n[{"unit":"2A","floor":5,"model":"A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"status":"Available","exposure":"South","terrace":354}]\nOmit fields you cannot find. Return [] if no pricing data is in the document.' }
          ]
        }],
      }),
      signal: AbortSignal.timeout(60000),
    });
    const j = await r.json();
    let text = (j?.content?.[0]?.text || '').trim();
    text = text.replace(/<\/?(?:antml:)?cite[^>]*>/g, '').replace(/```(?:json)?/g, '');
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) return [];
    return JSON.parse(m[0]);
  } catch (e) {
    console.warn('[Import] Pricing extract failed:', e.message);
    return [];
  }
}

export default async function handler(req, res) {
  // Writes / AI calls require the shared admin token — see api/_auth.js.
  if (!requireNcAuth(req, res)) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { folderUrl, buildingId } = req.body || {};
  if (!folderUrl)  return res.status(400).json({ error: 'folderUrl required' });
  if (!buildingId) return res.status(400).json({ error: 'buildingId required' });

  // Drive-only for now. Dropbox shared links are client-rendered and
  // actively block scraping; reliable Dropbox import would need OAuth.
  if (!/drive\.google\.com\/(drive\/folders|file\/d|open\?id=)/i.test(folderUrl)) {
    if (/dropbox\.com/i.test(folderUrl)) {
      return res.status(400).json({
        error: 'Dropbox folders are not currently supported. Move the files to a Google Drive folder shared as "Anyone with the link", and paste that URL instead.',
      });
    }
    return res.status(400).json({
      error: 'Only Google Drive folder URLs are supported. Expected format: https://drive.google.com/drive/folders/...',
    });
  }

  try {
    // Step 1: enumerate the folder using the existing dropbox-import logic
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers['x-forwarded-host'] || req.headers.host;
    const enumRes = await fetch(proto + '://' + host + '/api/dropbox-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderUrl }),
    });
    const enumData = await enumRes.json();
    if (!enumRes.ok) return res.status(500).json({ error: 'Enumerate failed: ' + (enumData.error || enumRes.status) });
    const allFiles = enumData.files || [];
    if (!allFiles.length) return res.status(200).json({ message: 'No files found', categorized: {} });

    console.log('[Import] Found', allFiles.length, 'files');

    // Step 2: download + classify + upload, with bounded concurrency
    const out = { floorPlanImages: [], renderings: [], brokerDocs: [], pricingUnits: [], errors: [] };
    const limit = 12; // hard cap per import to avoid timeouts
    const work = allFiles.slice(0, limit);

    for (let i = 0; i < work.length; i++) {
      const f = work[i];
      try {
        const dl = await fetchAsBuffer(f.url);
        let kind = categorizeByName(f.name);

        // PDF that's ambiguous? ask the model
        if (!kind && /\.pdf$/i.test(f.name)) {
          kind = await classifyWithAI(f.name, dl.buf.toString('base64'));
        }
        if (!kind) kind = 'brokerdoc'; // last-resort default

        // Upload to Blob and shape entry for the right field
        const url = await uploadToBlob(buildingId, kind, f.name, dl.buf, dl.contentType || (kind === 'rendering' ? 'image/jpeg' : 'application/pdf'));
        const baseName = f.name.replace(/\.[^.]+$/, '');

        if (kind === 'floorplan') {
          out.floorPlanImages.push({ name: baseName, thumb: url, pdf: url });
        } else if (kind === 'rendering') {
          out.renderings.push({ url, caption: baseName, category: 'Imported' });
        } else if (kind === 'pricing') {
          out.brokerDocs.push({ name: baseName, type: 'pricing', url }); // also keep the PDF
          const units = await extractPricing(dl.buf.toString('base64'));
          out.pricingUnits.push(...units);
        } else {
          out.brokerDocs.push({ name: baseName, type: 'document', url });
        }
      } catch (e) {
        console.warn('[Import] Failed', f.name, e.message);
        out.errors.push(f.name + ': ' + e.message);
      }
    }

    return res.status(200).json({
      processed:    work.length,
      totalFound:   allFiles.length,
      truncated:    allFiles.length > limit,
      categorized:  {
        floorPlanImages: out.floorPlanImages.length,
        renderings:      out.renderings.length,
        brokerDocs:      out.brokerDocs.length,
        pricingUnits:    out.pricingUnits.length,
      },
      data:    out,
      errors:  out.errors,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
