// api/upload-pdf.js — supports two modes:
//   Mode A (legacy): raw PDF in request body (Content-Type: application/pdf)
//                    Subject to Vercel's 4.5MB serverless body limit.
//   Mode B (new):    JSON body { blobUrl, buildingId, docName, context }
//                    The PDF was already uploaded directly to Blob via the
//                    @vercel/blob/client `upload()` SDK; this function just
//                    fetches it from Blob and runs the AI extraction. No
//                    body size limit applies — the PDF bytes never go through
//                    this function from the browser.
import { put } from '@vercel/blob';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 300;

function decodeHeader(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch { return value; }
}

async function extractWithClaude(pdfBase64, context) {
  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 4000,
      messages: [{ role: 'user', content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: 'Extract all structured data from this luxury real estate PDF. Context: ' + (context || 'general building document') + '\n\nReturn a JSON object with any fields you find. For pricing rows, the "model" field is REQUIRED and must be a short human-readable description like "2BR Bay" or "3BR + Den Ocean Premium" or "PH — 2BR Bay" (use PH prefix only if the floor is the penthouse/top-floor level). Build the model string from the unit type and view columns; never leave it blank. Set hasDen:true when the unit type mentions "Den" or "DEN".\n\n{"floorPlans":[{"name":"Model A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"exposure":"South","terrace":354}],"pricing":[{"unit":"203","floor":2,"model":"2BR + Den Ocean Premium","beds":2,"baths":2.5,"hasDen":true,"sqft":1992,"terrace":240,"price":2990000,"status":"Available","view":"Ocean Premium"}],"amenities":[],"keyFacts":[],"developer":null,"architect":null,"totalUnits":null,"totalFloors":null,"priceRange":null,"priceFrom":null,"estimatedDelivery":null,"constructionLoan":null,"salesBroker":null}\n\nReturn ONLY the JSON. No explanation. No backticks. No <cite> tags.' }
      ]}]
    }),
  });
  const aiData = await aiRes.json();
  const text   = aiData?.content?.[0]?.text || '';
  const cleaned = text.replace(/<\/?(?:antml:)?cite[^>]*>/g, '');
  const match = cleaned.match(/\{[\s\S]+\}/);
  if (!match) return {};
  try { return JSON.parse(match[0]); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const BLOB_TOKEN = getBlobToken();
  if (!BLOB_TOKEN) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured.' });

  const reqContentType = (req.headers['content-type'] || '').toLowerCase();
  const isJsonMode = reqContentType.includes('application/json');

  try {
    if (isJsonMode) {
      // -------- Mode B: blob URL already has the PDF --------
      let body = req.body;
      if (!body || typeof body === 'string') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { body = {}; }
      }
      const { blobUrl, buildingId, docName, context } = body || {};
      if (!blobUrl)    return res.status(400).json({ error: 'blobUrl required in JSON mode' });
      if (!buildingId) return res.status(400).json({ error: 'buildingId required' });

      console.log('[UploadPDF] JSON mode — fetching from blob:', blobUrl);
      const r = await fetch(blobUrl, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) return res.status(502).json({ error: 'Failed to fetch PDF from Blob: HTTP ' + r.status });
      const pdfBuffer = Buffer.from(await r.arrayBuffer());
      const pdfBase64 = pdfBuffer.toString('base64');

      const extracted = await extractWithClaude(pdfBase64, context);
      return res.status(200).json({ blobUrl, docName: docName || 'doc', extracted });
    }

    // -------- Mode A: legacy raw PDF body upload --------
    const buildingId = req.headers['x-building-id'] || 'unknown';
    const docName    = decodeHeader(req.headers['x-doc-name']) || ('doc-' + Date.now());
    const context    = req.headers['x-context']     || '';

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const pdfBuffer = Buffer.concat(chunks);
    if (pdfBuffer.length === 0) return res.status(400).json({ error: 'Empty body' });
    const pdfBase64 = pdfBuffer.toString('base64');

    const safeName = docName.replace(/[^a-z0-9._-]/gi, '_');
    const blobPath = 'buildings/' + buildingId + '/pdfs/' + safeName + '.pdf';
    const blob = await put(blobPath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
      token: BLOB_TOKEN,
      addRandomSuffix: true,
    });
    console.log('[UploadPDF] Legacy mode — stored:', blob.url);

    const extracted = await extractWithClaude(pdfBase64, context);
    return res.status(200).json({ blobUrl: blob.url, docName, extracted });
  } catch (err) {
    console.error('[UploadPDF] Error:', err.message);
    return res.status(500).json({
      error: err.message,
      hint: /private store/i.test(err.message || '')
        ? 'Vercel Blob store is set to private. Switch to public in dashboard.'
        : undefined,
    });
  }
}
