import { requireNcAuth } from './_auth.js';
// api/upload-pdf.js — modes:
//   Mode A (legacy):    raw PDF in request body (Content-Type: application/pdf).
//                       Subject to Vercel's 4.5MB serverless body limit.
//   Mode B (general):   JSON body { blobUrl, buildingId, docName, context }.
//                       PDF was already uploaded to Blob client-side; we fetch
//                       it and run Claude over it to extract any data.
//   Mode B (floorplan): JSON body { kind: 'floorplan', blobUrl, buildingId, sourceName }.
//                       Uses a focused floor-plan-only prompt, then merges the
//                       extracted metadata into the building's floorPlans array
//                       and auto-links matching pricing units by their model.
import { put }            from '@vercel/blob';
import { kv }             from '@vercel/kv';
import { getBlobToken }   from './_blob-env.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-sonnet-4-20250514';

const FLOORPLAN_PROMPT = `You are extracting metadata from a luxury condo floor plan PDF.

The PDF likely contains one or more pages. Focus on the page that actually shows the floor plan layout — skip disclaimer pages, cover pages, or marketing branding pages. The floor plan page typically shows the unit drawing and a small data table with INTERIOR/TERRACE/TOTAL square footages.

Return ONLY a single valid JSON object with these fields. No markdown, no commentary, no code fences.

{
  "name":       short label as printed on the plan, e.g. "Residence A", "Model L", "LPH-A", "A1", "Unit 2",
  "beds":       integer (just the number),
  "baths":      number, can be fractional like 2.5,
  "den":        true if the plan has a den/study/office, false otherwise,
  "interiorSF": integer, the INTERIOR (a/c, conditioned) square footage,
  "exteriorSF": integer, the TERRACE/EXTERIOR square footage,
  "totalSF":    integer, the TOTAL square footage,
  "exposure":   string or null — orientation if visible (e.g. "Northwest", "South", "Intracoastal", "East"),
  "floors":     string or null — floor range or specific floor (e.g. "Floors 7-18", "Floor 7", "Levels 5-14")
}

Use null for any field you cannot determine. Never invent values.`;

const GENERAL_PROMPT = (context) => 'Extract all structured data from this luxury real estate PDF. Context: ' + (context || 'general building document') + '\\n\\nReturn a JSON object with any fields you find. For pricing rows, the "model" field is REQUIRED and must be a short human-readable description like "2BR Bay" or "3BR + Den Ocean Premium" or "PH \u2014 2BR Bay" (use PH prefix only if the floor is the penthouse/top-floor level). Build the model string from the unit type and view columns; never leave it blank. Set hasDen:true when the unit type mentions "Den" or "DEN".\\n\\n{"floorPlans":[{"name":"Model A","beds":2,"baths":2.5,"sqft":1483,"price":1950000,"exposure":"South","terrace":354}],"pricing":[{"unit":"203","floor":2,"model":"2BR + Den Ocean Premium","beds":2,"baths":2.5,"hasDen":true,"sqft":1992,"terrace":240,"price":2990000,"status":"Available","view":"Ocean Premium"}],"amenities":[],"keyFacts":[],"developer":null,"architect":null,"totalUnits":null,"totalFloors":null,"priceRange":null,"priceFrom":null}';

function decodeHeader(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch { return value; }
}

async function callClaude(pdfBase64, promptText) {
  const r = await fetch(ANTHROPIC_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 2000,
      messages:   [{ role: 'user', content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text',     text: promptText },
      ]}],
    }),
  });
  if (!r.ok) {
    const errText = await r.text().catch(() => '');
    throw new Error('Claude API ' + r.status + ': ' + errText.slice(0, 200));
  }
  const j    = await r.json();
  const text = j.content?.[0]?.text || '';
  const m    = text.match(/\{[\s\S]*\}/);
  if (!m) return {};
  try { return JSON.parse(m[0]); } catch { return {}; }
}

// Once a floor plan has been extracted, write it into the building and try to
// link any matching pricing units. Idempotent — replaces an entry with the
// same name, otherwise appends.
async function persistFloorPlan(buildingId, plan, blobUrl, sourceName, thumbUrl) {
  const key      = 'building:' + buildingId;
  const building = await kv.get(key);
  if (!building) throw new Error('Building not found: ' + buildingId);

  const entry = {
    name:       plan.name || sourceName || 'Untitled plan',
    beds:       plan.beds       ?? null,
    baths:      plan.baths      ?? null,
    den:        plan.den        ?? false,
    interiorSF: plan.interiorSF ?? null,
    exteriorSF: plan.exteriorSF ?? null,
    totalSF:    plan.totalSF    ?? null,
    exposure:   plan.exposure   ?? null,
    floors:     plan.floors     ?? null,
    thumb:      thumbUrl || blobUrl, // PNG render of page 1 if available, otherwise PDF URL
    pdf:        blobUrl,
    units:      [],
    sourceName: sourceName || null,
    addedAt:    Date.now(),
  };

  const fps      = Array.isArray(building.floorPlans) ? building.floorPlans.slice() : [];
  const existing = fps.findIndex(p => p.name && entry.name && p.name.toLowerCase() === entry.name.toLowerCase());
  if (existing >= 0) {
    // Preserve any manual edits (esp. units array)
    fps[existing] = { ...fps[existing], ...entry, units: fps[existing].units || [] };
  } else {
    fps.push(entry);
  }

  // Auto-link pricing units by model match, fill entry.units
  const pricingKey = 'pricing:' + buildingId;
  const pricing    = (await kv.get(pricingKey)) || [];
  if (Array.isArray(pricing) && pricing.length > 0 && entry.name) {
    const lc        = entry.name.toLowerCase();
    const matches   = pricing.filter(u => {
      const m = (u.model || '').toLowerCase();
      const n = (u.floorplanName || '').toLowerCase();
      return m === lc || n === lc || m.startsWith(lc + ' ') || m.startsWith(lc + ' \u2014');
    });
    if (matches.length > 0) {
      const idx = existing >= 0 ? existing : fps.length - 1;
      fps[idx].units = matches.map(u => u.unit).filter(Boolean);
      // Also write floorplanName back onto each matching pricing unit
      const updatedPricing = pricing.map(u => {
        const m = (u.model || '').toLowerCase();
        const n = (u.floorplanName || '').toLowerCase();
        const isMatch = m === lc || n === lc || m.startsWith(lc + ' ') || m.startsWith(lc + ' \u2014');
        return isMatch ? { ...u, floorplanName: entry.name } : u;
      });
      await kv.set(pricingKey, updatedPricing);
    }
  }

  await kv.set(key, { ...building, floorPlans: fps, updatedAt: Date.now() });
  return { entry, totalPlans: fps.length };
}

export default async function handler(req, res) {
  // Writes / AI calls require the shared admin token — see api/_auth.js.
  if (!requireNcAuth(req, res)) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const BLOB_TOKEN = getBlobToken();
  if (!BLOB_TOKEN) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured.' });

  const ct         = req.headers['content-type'] || '';
  const isJsonMode = ct.includes('application/json');

  try {
    if (isJsonMode) {
      let body = req.body;
      if (!body || typeof body === 'string') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      }
      const { kind, blobUrl, thumbUrl, buildingId, docName, context, sourceName } = body || {};
      if (!blobUrl)    return res.status(400).json({ error: 'blobUrl required in JSON mode' });
      if (!buildingId) return res.status(400).json({ error: 'buildingId required' });

      // ---- Floor plan mode: focused extraction + KV merge ----
      if (kind === 'floorplan') {
        console.log('[UploadPDF] Floor plan mode — fetching:', blobUrl);
        const r = await fetch(blobUrl);
        if (!r.ok) return res.status(502).json({ error: 'Failed to fetch PDF from Blob: HTTP ' + r.status });
        const ab        = await r.arrayBuffer();
        const pdfBase64 = Buffer.from(ab).toString('base64');

        const extracted = await callClaude(pdfBase64, FLOORPLAN_PROMPT);
        if (!extracted || !extracted.name) {
          // Still store under the source filename if Claude failed to read it
          const fallback = await persistFloorPlan(buildingId, { name: (sourceName || 'Untitled').replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') }, blobUrl, sourceName, thumbUrl);
          return res.status(200).json({ kind: 'floorplan', extracted: null, persisted: fallback, warning: 'Claude could not extract metadata; stored with filename only.' });
        }
        const persisted = await persistFloorPlan(buildingId, extracted, blobUrl, sourceName, thumbUrl);
        return res.status(200).json({ kind: 'floorplan', extracted, persisted });
      }

      // ---- General mode (existing behaviour, preserved) ----
      console.log('[UploadPDF] JSON mode — fetching:', blobUrl);
      const r = await fetch(blobUrl);
      if (!r.ok) return res.status(502).json({ error: 'Failed to fetch PDF from Blob: HTTP ' + r.status });
      const ab        = await r.arrayBuffer();
      const pdfBase64 = Buffer.from(ab).toString('base64');
      const extracted = await callClaude(pdfBase64, GENERAL_PROMPT(context));
      return res.status(200).json({ blobUrl, docName: docName || 'doc', extracted });
    }

    // ---- Mode A: legacy raw PDF body upload ----
    const docName    = decodeHeader(req.headers['x-doc-name'])    || 'doc';
    const context    = decodeHeader(req.headers['x-context'])     || '';
    const buildingId = decodeHeader(req.headers['x-building-id']) || 'general';

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const pdfBuffer = Buffer.concat(chunks);
    if (pdfBuffer.length === 0) return res.status(400).json({ error: 'Empty body' });
    const pdfBase64 = pdfBuffer.toString('base64');

    const safeName = (docName || 'doc').replace(/[^a-zA-Z0-9-_.]/g, '-');
    const blobPath = 'buildings/' + buildingId + '/' + safeName + '.pdf';
    const blob     = await put(blobPath, pdfBuffer, {
      access:          'public',
      contentType:     'application/pdf',
      token:           BLOB_TOKEN,
      addRandomSuffix: true,
    });
    console.log('[UploadPDF] Legacy mode — stored:', blob.url);

    const extracted = await callClaude(pdfBase64, GENERAL_PROMPT(context));
    return res.status(200).json({ blobUrl: blob.url, docName, extracted });
  } catch (err) {
    console.error('[UploadPDF] Error:', err.message);
    return res.status(500).json({
      error: err.message,
      hint:  /private store/i.test(err.message || '')
             ? 'Vercel Blob store is set to private. Switch to public in dashboard.'
             : undefined,
    });
  }
}
