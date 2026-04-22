// api/research-building.js
// Claude-powered building research v3
// Uses fetch() for all HTTP -- no require() needed
export const maxDuration = 300;

const PEOPLE_BLOCK = /headshot|portrait|\.?team|staff|executive|director|bio|author|speaker|ceo|president|founder|partner|employee|agent-photo|broker-photo/i;
const LOGO_BLOCK   = /logo|icon|favicon|badge|seal|watermark|sprite|btn-|button-|arrow|chevron/i;
const SKIP_EXT     = /\/(social|facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|whatsapp|google)\./i;

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
        'Referer': url,
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
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
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = origin.protocol + '//' + origin.host + url;
      else if (!url.startsWith('http')) continue;
      url = url.replace(/-\d+x\d+(\.(?:jpg|jpeg|png|webp))$/i, '$1');
      if (map.has(url)) continue;
      const check = (url + ' ' + alt).toLowerCase();
      if (PEOPLE_BLOCK.test(check) || LOGO_BLOCK.test(check) || SKIP_EXT.test(url)) continue;
      if (/\d+x\d+/.test(url) && url.includes('thumbnail')) continue;
      let cat = 'Exterior';
      if (/floor.?plan|floorplan|layout|unit.?plan|site.?plan/.test(check)) cat = 'Floor Plans';
      else if (/pool|amenity|gym|fitness|spa|yoga|lounge|rooftop|bowling|pickleball|wellness/.test(check)) cat = 'Amenities';
      else if (/living|bedroom|bath|interior|residence|terrace|balcon|kitchen/.test(check)) cat = 'Residences';
      else if (/view|aerial|intracoastal|ocean|skyline|water|lake|bird|drone/.test(check)) cat = 'Views';
      else if (/lobby|arrival|entrance|motor.?court|porte|foyer/.test(check)) cat = 'Arrival';
      map.set(url, { url, caption: alt.substring(0, 120), category: cat });
    }
    for (const m of html.matchAll(/url\(["']?(https?:\/\/[^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi)) {
      let url = m[1].replace(/-\d+x\d+(\.(?:jpg|jpeg|png|webp))$/i, '$1');
      if (map.has(url)) continue;
      const check = url.toLowerCase();
      if (PEOPLE_BLOCK.test(check) || LOGO_BLOCK.test(check)) continue;
      map.set(url, { url, caption: '', category: 'Exterior' });
    }
  } catch {}
  return Array.from(map.values()).filter(i => !i.url.includes('base64') && !i.url.includes('placeholder'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const base = new URL(url.startsWith('http') ? url : 'https://' + url);
    const host = base.hostname;
    const paths = ['/', '/residences', '/amenities', '/team', '/contact', '/neighborhood',
      '/architecture-design', '/press', '/location', '/about', '/interiors', '/gallery',
      '/penthouses', '/availability'];

    console.log('[Research] Fetching from', host);
    const pages = await Promise.all(paths.map(async (path) => {
      const pageUrl = base.protocol + '//' + host + path;
      const html = await fetchPage(pageUrl);
      return html ? { url: pageUrl, text: toText(html).substring(0, 5000), images: extractImages(html, pageUrl) } : null;
    }));

    const validPages = pages.filter(Boolean);
    const allImages  = [...new Map(validPages.flatMap(p => p.images).map(i => [i.url, i])).values()];
    console.log('[Research]', validPages.length, 'pages,', allImages.length, 'images');

    const siteContent = validPages.map(p => '\n=== ' + p.url + ' ===\n' + p.text).join('\n\n').substring(0, 35000);
    const imageList   = allImages.slice(0, 150).map(i => i.url + ' [' + i.category + '] ' + i.caption).join('\n');

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
      'MANDATORY RESEARCH TASKS:',
      '1. Search "[building name] West Palm Beach total units floors"',
      '2. Search "[building name] address"',
      '3. Search "[building name] developer architect"',
      '4. Search "[building name] pricing price range"',
      '5. Search "[building name] delivery completion date"',
      '6. Search "[building name] sales contact phone"',
      '7. Search "[building name] key facts amenities"',
      '',
      'Return ONLY valid JSON (no markdown, no backticks):',
      '{',
      '  "suggestedId": "lowercasealphanumericonly",',
      '  "suggestedName": "Building Name",',
      '  "subtitle": "Neighborhood",',
      '  "tagline": "Marketing tagline",',
      '  "address": "Full address",',
      '  "phone": "561.XXX.XXXX or null",',
      '  "phone2": null,',
      '  "email": null,',
      '  "instagram": "full URL or null",',
      '  "website": "domain.com",',
      '  "salesGallery": "address or null",',
      '  "status": "Pre-Construction / Sales Launched",',
      '  "salesLaunch": "Month Year or null",',
      '  "estimatedDelivery": "Q4 2027 or null",',
      '  "constructionStart": "Month Year or null",',
      '  "constructionLoan": "$380M -- Lender or null",',
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
      '  "amenities": ["complete amenity list from site"],',
      '  "images": [{"url":"exact URL","caption":"descriptive","category":"Exterior"}]',
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

      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
        },
        body: payload,
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        console.error('[Research] API error', apiRes.status, errText.substring(0, 200));
        return res.status(500).json({ error: 'API error ' + apiRes.status });
      }

      const r = await apiRes.json();
      const content    = r.content || [];
      const textBlocks = content.filter(b => b.type === 'text');
      const toolBlocks = content.filter(b => b.type === 'tool_use');
      console.log('[Research] stop=' + r.stop_reason + ' text=' + textBlocks.length + ' tools=' + toolBlocks.length);

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
            content: b.output ? (typeof b.output === 'string' ? b.output : JSON.stringify(b.output)) : 'Search completed',
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
    building.renderings = (building.images || []).map(i => ({ url: i.url, caption: i.caption, category: i.category }));
    building.pagesScraped  = validPages.length;
    building.rawImageCount = allImages.length;

    // Map to our canonical field names
    const project = {
      suggestedId:       building.suggestedId,
      suggestedName:     building.suggestedName,
      subtitle:          building.subtitle,
      tagline:           building.tagline,
      address:           building.address,
      phone:             building.phone,
      phone2:            building.phone2,
      email:             building.email,
      instagram:         building.instagram,
      website:           building.website,
      salesGallery:      building.salesGallery,
      status:            building.status,
      salesLaunch:       building.salesLaunch,
      estimatedDelivery: building.estimatedDelivery,
      constructionStart: building.constructionStart,
      constructionLoan:  building.constructionLoan,
      developer:         building.developer,
      architect:         building.architect,
      interiorDesigner:  building.interiorDesigner,
      landscape:         building.landscape,
      salesBroker:       building.salesBroker,
      management:        building.management,
      contractor:        building.contractor,
      totalUnits:        building.totalUnits,
      totalFloors:       building.totalFloors,
      towers:            building.towers,
      residencesPerFloor:building.residencesPerFloor,
      siteSF:            building.siteSF,
      amenitiesSF:       building.amenitiesSF,
      leedCertified:     building.leedCertified,
      priceRange:        building.priceRange,
      priceFrom:         building.priceFrom,
      unitSizeRange:     building.unitSizeRange,
      bedrooms:          building.bedrooms,
      views:             building.views,
      parking:           building.parking,
      locationNote:      building.locationNote,
      keyFacts:          building.keyFacts || [],
      amenities:         building.amenities || [],
      renderings:        building.renderings || [],
      floorPlanImages:   [],
      floorPlans:        [],
      brokerDocs:        [],
    };

    console.log('[Research] OK:', project.suggestedName, '| images:', project.renderings.length, '| iterations:', itr);
    return res.status(200).json({ project });

  } catch (err) {
    console.error('[Research] Fatal:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
