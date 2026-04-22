// api/upload-pdf.js — receives PDF, stores to Blob, extracts data with Claude
export const maxDuration = 300;
const https   = require('https');
const { put } = require('@vercel/blob');

async function extractWithClaude(pdfBase64, context) {
  const payload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
        },
        {
          type: 'text',
          text: [
            'Extract all structured data from this luxury real estate PDF.',
            'Context: ' + (context || 'general building document'),
            '',
            'Return a JSON object with any fields you find:',
            '{',
            '  "floorPlans": [{"name":"Model A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"exposure":"South","terrace":354}],',
            '  "pricing": [{"unit":"2A","floor":5,"model":"A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"status":"Available"}],',
            '  "amenities": [],',
            '  "keyFacts": [],',
            '  "developer": null, "architect": null,',
            '  "totalUnits": null, "totalFloors": null,',
            '  "priceRange": null, "priceFrom": null,',
            '  "estimatedDelivery": null, "constructionLoan": null, "salesBroker": null',
            '}',
            'Return ONLY the JSON. No explanation. No backticks.',
          ].join('\n'),
        },
      ],
    }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const buildingId = req.headers['x-building-id'] || 'unknown';
  const docName    = req.headers['x-doc-name']    || ('doc-' + Date.now());
  const context    = req.headers['x-context']     || '';

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const pdfBuffer = Buffer.concat(chunks);
    const pdfBase64 = pdfBuffer.toString('base64');

    const safeName = docName.replace(/[^a-z0-9._-]/gi, '_');
    const blobPath = 'buildings/' + buildingId + '/pdfs/' + safeName + '.pdf';
    const blob = await put(blobPath, pdfBuffer, { access: 'public', contentType: 'application/pdf' });
    console.log('[UploadPDF] Stored:', blob.url);

    const aiResult  = await extractWithClaude(pdfBase64, context);
    const text      = aiResult?.content?.[0]?.text || '';
    let extracted   = {};
    const match     = text.match(/\{[\s\S]+\}/);
    if (match) { try { extracted = JSON.parse(match[0]); } catch {} }

    return res.status(200).json({ blobUrl: blob.url, docName, extracted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
