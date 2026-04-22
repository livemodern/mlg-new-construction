// api/research-building.js
// Claude-powered building research v3
// Fetches all key pages, filters people/headshots, Claude uses web_search
// to find pricing/press/specs, enforces mandatory fields, returns complete profile

export const maxDuration = 300;
const https = require('https');
const http  = require('http');

const PEOPLE_BLOCK = /headshot|portrait|\.?team|staff|executive|director|bio|author|speaker|ceo|president|founder|partner|employee|agent-photo|broker-photo/i;
const LOGO_BLOCK   = /logo|icon|favicon|badge|seal|watermark|sprite|btn-|button-|arrow|chevron/i;
const SKIP_EXT     = /\/(social|facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|whatsapp|google)\./i;

async function fetchPage(url) {
  return new Promise((resolve) => {
    try {
      const p = new URL(url);
      const mod = p.protocol === 'https:' ? https : http;
      const req = mod.request({
        hostname: p.hostname,
        path: p.pathname + (p.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,*/*',
          'Referer': url,
        },
        timeout: 10000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchPage(res.headers.location).then(resolve); return;
        }
        if (!res.statusCode || res.statusCode >= 400) { resolve(null); return; }
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => resolve(b));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch { resolve(null); }
  });
}

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImages(html, baseUrl) {
  const map = new Map();
  try {
    const origin = new URL(baseUrl);
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*?)["'])?/gi)) {
      let url = m[1];
      const alt = m[2] || '';
      if (!url || url.startsWith('data:')) continue;
      if (url.startsWith('//'))     url = 'https:' + url;
      else if (url.startsWith('/')) url = origin.protocol + '//' + origin.host + url;
      else if (!url.startsWith('http')) continue;
      url = url.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
      if (map.has(url)) continue;
      const check = (url + ' ' + alt).toLowerCase();
      if (PEOPLE_BLOCK.test(check) || LOGO_BLOCK.test(check) || SKIP_EXT.test(url)) continue;
      if (/\d+x\d+/.test(url) && url.includes('thumbnail')) continue;
      let cat = 'Exterior';
      if (/floor.?plan|floorplan|layout|unit.?plan|site.?plan/.test(check))              cat = 'Floor Plans';
      else if (/pool|amenity|gym|fitness|spa|yoga|lounge|rooftop|bowling|pickleball|wellness|simulator|theater|library|game|dining|wine/.test(check)) cat = 'Amenities';
      else if (/living|bedroom|bath|interior|residence|terrace|balcon|kitchen|loggia|master/.test(check)) cat = 'Residences';
      else if (/view|aerial|intracoastal|ocean|skyline|water|lake|bird|drone/.test(check)) cat = 'Views';
      else if (/lobby|arrival|entrance|motor.?court|porte|foyer/.test(check))             cat = 'Arrival';
      map.set(url, { url, caption: alt.substring(0, 120), category: cat });
    }
    for (const m of html.matchAll(/url\(["']?(https?:\/\/[^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi)) {
      let url = m[1].replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
      if (map.has(url)) continue;
      const check = url.toLowerCase();
      if (PEOPLE_BLOCK.test(check) || LOGO_BLOCK.test(check)) continue;
      map.set(url, { url, caption: '', category: 'Exterior' });
    }
  } catch {}
  return Array.from(map.values()).filter(i =>
    !i.url.includes('base64') && !i.url.includes('placeholder')
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const base = new URL(url.startsWith('http') ? url : 'https://' + url);
    const host = base.hostname;

    const paths = ['/', '/residences', '/amenities', '/team', '/contact',
                   '/neighborhood', '/architecture-design', '/press',
                   '/location', '/about', '/interiors', '/gallery',
                   '/penthouses', '/availability'];

    console.log('[Research] Fetching from', host);
    const pages = await Promise.all(paths.map(async (path) => {
      const pageUrl = base.protocol + '//' + host + path;
      const html = await fetchPage(pageUrl);
      return html ? {
        url: pageUrl,
        text: toText(html).substring(0, 5000),
        images: extractImages(html, pageUrl),
      } : null;
    }));

    const validPages = pages.filter(Boolean);
    const allImages  = [...new Map(
      validPages.flatMap(p => p.images).map(i => [i.url, i])
    ).values()];

    console.log('[Research]', validPages.length, 'pages,', allImages.length, 'images (filtered)');

    const siteContent = validPages
      .map(p => '\n=== ' + p.url + ' ===\n' + p.text)
      .join('\n\n')
      .substring(0, 35000);

    const imageList = allImages
      .slice(0, 150)
      .map(i => i.url + ' [' + i.category + '] ' + i.caption)
      .join('\n');

    const prompt = [
      'You are a luxury real estate data specialist for Modern Living Group in West Palm Beach, FL.',
      '',
      'Research this development EXHAUSTIVELY using web search and return a complete validated building profile.',
      '',
      'DEVELOPMENT: ' + base.href,
      '',
      'WEBSITE CONTENT (' + validPages.length + ' pages):',
      siteContent,
      '',
      'SITE IMAGES (' + allImages.length + ' found, people/logos filtered):',
      imageList,
      '',
      'MANDATORY RESEARCH TASKS — search each before accepting null:',
      '1. "[building name] West Palm Beach total units floors" — must populate totalUnits + totalFloors',
      '2. "[building name] address" — must populate full address',
      '3. "[building name] developer architect" — must populate developer + architect',
      '4. "[building name] pricing price range" — must populate priceRange + priceFrom',
      '5. "[building name] delivery completion date" — populate estimatedDelivery',
      '6. "[building name] construction loan" — populate if findable',
      '7. "[building name] sales contact phone gallery" — populate contact info',
      '8. "[developer] [building] press release announcement" — populate keyFacts from credible sources',
      '9. Cross-reference unit count and floor count from 2+ sources',
      '',
      'IMAGE RULES: Select only renderings, architectural photos, interior renders, amenity spaces, aerial/drone views.',
      'Do NOT select: people, headshots, team photos, staff portraits. Images already filtered but confirm.',
      '',
      'Return ONLY valid JSON (no markdown, no backticks, no explanation):',
      '{',
      '  "suggestedId": "lowercasealphanumericonly",',
      '  "suggestedName": "Building Name",',
      '  "subtitle": "Neighborhood e.g. South Flagler",',
      '  "tagline": "Marketing tagline from site",',
      '  "address": "Full address with city state zip — MANDATORY",',
      '  "phone": "561.XXX.XXXX or null",',
      '  "phone2": null,',
      '  "email": null,',
      '  "instagram": "full URL or null",',
      '  "website": "domain.com only",',
      '  "salesGallery": "Full sales gallery address or null",',
      '  "status": "Pre-Construction / Sales Launched OR Under Construction OR Completed",',
      '  "salesLaunch": "Month Year or null",',
      '  "estimatedDelivery": "Q4 2027 format or null",',
      '  "constructionStart": "Month Year or null",',
      '  "constructionLoan": "$380M — Lender or null",',
      '  "developer": "MANDATORY",',
      '  "architect": "MANDATORY",',
      '  "interiorDesigner": null,',
      '  "landscape": null,',
      '  "salesBroker": null,',
      '  "management": null,',
      '  "contractor": null,',
      '  "totalUnits": 0,',
      '  "totalFloors": 0,',
      '  "towers": null,',
      '  "residencesPerFloor": null,',
      '  "siteSF": null,',
      '  "amenitiesSF": null,',
      '  "leedCertified": null,',
      '  "priceRange": "MANDATORY",',
      '  "priceFrom": 0,',
      '  "unitSizeRange": null,',
      '  "bedrooms": "MANDATORY",',
      '  "views": null,',
      '  "parking": null,',
      '  "locationNote": null,',
      '  "keyFacts": ["6-8 compelling agent-ready facts with specific numbers"],',
      '  "amenities": ["complete granular amenity list from site"],',
      '  "images": [{"url":"exact URL from list above","caption":"descriptive","category":"Exterior"}]',
      '}',
    ].join('\n');

    const messages = [{ role: 'user', content: prompt }];
    let finalText = null;
    let itr = 0;

    while (!finalText && itr < 10) {
      itr++;
      console.log('[Research] iteration', itr);

      const payload = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      });

      const r = await new Promise((resolve, reject) => {
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
          let b = '';
          res.on('data', c => b += c);
          res.on('end', () => {
            try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
            catch { resolve({ status: res.statusCode, body: null }); }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      if (r.status !== 200) {
        console.error('[Research] API error', r.status, JSON.stringify(r.body).substring(0, 200));
        return res.status(500).json({ error: 'API error ' + r.status });
      }

      const content    = r.body.content || [];
      const textBlocks = content.filter(b => b.type === 'text');
      const toolBlocks = content.filter(b => b.type === 'tool_use');

      console.log('[Research] stop=' + r.body.stop_reason + ' text=' + textBlocks.length + ' tools=' + toolBlocks.length);

      if (textBlocks.length > 0 && toolBlocks.length === 0) {
        finalText = textBlocks.map(b => b.text).join('');
        break;
      }

      if (toolBlocks.length > 0) {
        messages.push({ role: 'assistant', content });
        messages.push({
          role: 'user',
          content: toolBlocks.map(b => ({
            type: 'tool_result',
            tool_use_id: b.id,
            content: b.output
              ? (typeof b.output === 'string' ? b.output : JSON.stringify(b.output))
              : 'Search completed',
          })),
        });
      } else {
        break;
      }
    }

    if (!finalText) return res.status(500).json({ error: 'No response after ' + itr + ' iterations' });

    const match = finalText.match(/\{[\s\S]+\}/);
    if (!match) return res.status(500).json({ error: 'No JSON in response', preview: finalText.substring(0, 300) });

    let building;
    try { building = JSON.parse(match[0]); }
    catch (e) { return res.status(500).json({ error: 'JSON parse: ' + e.message }); }

    if (!building.images || !building.images.length) building.images = allImages.slice(0, 40);
    building.pdfs         = [];
    building.pagesScraped = validPages.length;
    building.rawImageCount = allImages.length;

    console.log('[Research] OK:', building.suggestedName, '| images:', building.images.length, '| iterations:', itr);
    return res.status(200).json(building);

  } catch (err) {
    console.error('[Research] Fatal:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
