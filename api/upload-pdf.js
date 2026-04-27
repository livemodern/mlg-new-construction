// api/upload-pdf.js — using @vercel/blob SDK
import { put } from '@vercel/blob';
import { getBlobToken } from './_blob-env.js';

export const maxDuration = 300;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const buildingId = req.headers['x-building-id'] || 'unknown';
  const docName    = req.headers['x-doc-name']    || ('doc-' + Date.now());
  const context    = req.headers['x-context']     || '';
  const BLOB_TOKEN = getBlobToken();
  if (!BLOB_TOKEN) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured. Make sure the Blob store is connected to this Vercel project and the deployment has been refreshed.' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const pdfBuffer = Buffer.concat(chunks);
    const pdfBase64 = pdfBuffer.toString('base64');

    const safeName = docName.replace(/[^a-z0-9._-]/gi, '_');
    const blobPath = 'buildings/' + buildingId + '/pdfs/' + safeName + '.pdf';
    const blob = await put(blobPath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
      token: BLOB_TOKEN,
      addRandomSuffix: true,
    });
    console.log('[UploadPDF] Stored:', blob.url);

    // Extract with Claude
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 4000,
        messages: [{ role: 'user', content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: 'Extract all structured data from this luxury real estate PDF. Context: ' + (context || 'general building document') + '\n\nReturn a JSON object with any fields you find:\n{"floorPlans":[{"name":"Model A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"exposure":"South","terrace":354}],"pricing":[{"unit":"2A","floor":5,"model":"A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"status":"Available"}],"amenities":[],"keyFacts":[],"developer":null,"architect":null,"totalUnits":null,"totalFloors":null,"priceRange":null,"priceFrom":null,"estimatedDelivery":null,"constructionLoan":null,"salesBroker":null}\nReturn ONLY the JSON. No explanation. No backticks. No <cite> tags.' }
        ]}]
      }),
    });
    const aiData = await aiRes.json();
    const text   = aiData?.content?.[0]?.text || '';
    let extracted = {};
    const cleaned = text.replace(/<\/?(?:antml:)?cite[^>]*>/g, '');
    const match = cleaned.match(/\{[\s\S]+\}/);
    if (match) { try { extracted = JSON.parse(match[0]); } catch {} }

    return res.status(200).json({ blobUrl: blob.url, docName, extracted });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      hint: /private store/i.test(err.message || '')
        ? 'Vercel Blob store is set to private. Switch to public in dashboard.'
        : undefined,
    });
  }
}

