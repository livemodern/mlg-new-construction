import { requireNcAuth } from './_auth.js';
// api/research-building.js
// Claude-powered building research v3
// Uses fetch() for all HTTP -- no require() needed
export const maxDuration = 300;

// One unified block list — covers logos, icons, decoration, team headshots,
// lifestyle shots, social-share thumbs, and assorted page-decoration images.
// Anything matching here is dropped before categorization runs.
const BLOCK_PATTERNS = /(?:^|[^a-z])(?:logo|icon|favicon|badge|seal|watermark|sprite|chevron|outline|foil|footer|header[-_]bg|sketch|grayscale|map[-_]icon|map[-_]marker|developer|developers|headshot|portrait|team[-_]|staff|executive|director|bio|author|speaker|ceo|president|founder|employee|agent[-_]photo|broker[-_]photo|lifestyle|couple|family[-_]portrait|crowd|guests|audience|model[-_]shot|festive|inquire[-_]|thank[-_]you|winter[-_]wonderland|cookie|banner[-_]ad|social[-_]share|instagram|facebook|twitter|linkedin|whatsapp|youtube|btn[-_]|button[-_]|arrow|placeholder|loading|spinner|hamburger|close[-_]x|menu[-_]bar)/i;
const SKIP_EXT     = /\.(svg|gif|webp\?|css|js)(\?|$)/i;

// Strict allow-list categorizer. Returns null (= DROP) if filename doesn't
// match any recognized building/real-estate category. This is more aggressive
// than defaulting to 'Exterior' — uncategorizable junk like 'DSC00359.jpg',
// 'Image-1.png', 'Full-White.png', 'Group-1640.png' would otherwise leak in
// as top-priority Exterior shots.
function categorizeImage(check) {
  if (/floor.?plan|floorplan|layout|unit.?plan|site.?plan|residence.?plan/.test(check)) return 'Floor Plans';
  if (/lobby|arrival|entrance|motor.?court|porte|foyer|valet/.test(check))               return 'Arrival';
  if (/pool|gym|fitness|spa|yoga|lounge|rooftop|wellness|sauna|wine[-_]?room|cabana|owners[-_]?lounge|theater|game[-_]room|kids[-_]room|amenit/.test(check)) return 'Amenities';
  if (/living|bedroom|bath|interior|residence|terrace|balcon|kitchen|master|ensuite|great[-_]?room|\bden\b/.test(check)) return 'Residences';
  if (/exterior|tower|building|aerial|drone|skyline|architectur|hero[-_\s]|cam[-_]?\d/.test(check)) return 'Exterior';
  if (/view|intracoastal|ocean[-_]?view|water[-_]?view|sunset|sunrise|cityscape|marina/.test(check)) return 'Views';
  return null;
}
// Page-context fallback: when filename doesn't categorize, use the URL slug
// of the page the image came from. Yoast sitemap groups images by page,
// so an image listed under /amenities is virtually amenity-related even if
// the filename is generic. Same for /residences, /location, etc.
function categorizeFromPath(pageUrl) {
  if (!pageUrl) return null;
  let path;
  try { path = new URL(pageUrl).pathname.toLowerCase(); }
  catch { return null; }
  if (/(\/team|\/staff|\/bio|\/leadership)/.test(path)) return null;
  if (/(\/floor.?plan|\/floorplan|\/residence|\/penthouse|\/the.?home|\/interior|\/suite)/.test(path)) return 'Residences';
  if (/(\/amenit|\/wellness|\/services|\/spa)/.test(path))                                              return 'Amenities';
  if (/(\/arrival|\/lobby)/.test(path))                                                                   return 'Arrival';
  if (/(\/location|\/neighborhood|\/vision|\/architectur|\/about)/.test(path))                          return 'Exterior';
  return null; // home page, /gallery, /press, /downloads — no fallback, strict applies
}

// Block social-media tracking pixels and the like
const SKIP_DOMAIN = /\/(social|facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|whatsapp|google|adnxs|doubleclick)\./i;

// ---------------------------------------------------------------------------
// AI vision filter — drops people-focused photos (lifestyle shots with humans
// as the focus) before they hit the gallery. Filename heuristics catch the
// obvious "headshot" / "team-portrait" cases earlier; this catches the
// subtler ones (developer site shows a couple at the pool with the building
// barely visible behind them, or a model walking through a lobby — both
// would survive filename filtering but aren't real estate renderings).
//
// Returns the filtered array. On any failure (API down, parse error, etc.)
// returns the input unchanged — better to over-include than break the flow.
async function filterPeopleImages(renderings, buildingName) {
  if (!renderings || renderings.length === 0) return renderings;
  if (!process.env.ANTHROPIC_API_KEY) return renderings;

  const numbered = renderings.map((r, i) => (i + 1) + '. ' + r.url + ' [' + (r.category || 'Uncategorized') + '] ' + (r.caption || '')).join('\n');
  const prompt = [
    'You are filtering images for a luxury real estate broker tool. The goal is to keep ONLY architectural and amenity-space imagery — exteriors, interiors, renderings, amenity views, building shots, floor plans, layouts.',
    '',
    'REJECT any image where people are the visual focus or subject:',
    '- Lifestyle shots showing models/residents using a space',
    '- Couples, families, or groups posing',
    '- Headshots, portraits, or team/staff photos',
    '- Photos where humans dominate the frame',
    '',
    'ACCEPT images where the space, architecture, or rendering is the focus, even if a small figure appears for scale (e.g. a person silhouette in a wide pool deck shot is fine — a couple having dinner is not).',
    '',
    'Building: ' + (buildingName || 'unknown'),
    '',
    'CANDIDATES (' + renderings.length + ' images):',
    numbered,
    '',
    'For each, decide KEEP or REJECT. Respond with ONLY a JSON array of decisions in the same order, no explanation:',
    '["KEEP","REJECT","KEEP",...]',
    '',
    'Use the URL filename and your visual knowledge of typical luxury real estate photography to judge. When uncertain, KEEP (we prefer false positives over false negatives).',
  ].join('\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      console.warn('[filterPeopleImages] API error', r.status, '— passing through unchanged');
      return renderings;
    }
    const j = await r.json();
    const text = (j.content || []).map(c => c.text || '').join('');
    const match = text.match(/\[[^\]]+\]/);
    if (!match) {
      console.warn('[filterPeopleImages] no array in response — passing through');
      return renderings;
    }
    const decisions = JSON.parse(match[0]);
    if (!Array.isArray(decisions) || decisions.length !== renderings.length) {
      console.warn('[filterPeopleImages] decision count mismatch:', decisions.length, 'vs', renderings.length, '— passing through');
      return renderings;
    }
    const kept = renderings.filter((_, i) => /KEEP/i.test(decisions[i] || ''));
    const dropped = renderings.length - kept.length;
    console.log('[filterPeopleImages] kept', kept.length, '| dropped', dropped);
    return kept;
  } catch (e) {
    console.warn('[filterPeopleImages] exception:', e.message, '— passing through');
    return renderings;
  }
}

// ---------------------------------------------------------------------------
// Amenity categorizer — converts a flat list of amenity strings into the
// canonical [{category, icon, items}] shape used elsewhere in the app
// (see Olara, Alba). Categories are not pre-defined; Claude picks reasonable
// ones based on the actual amenities present (e.g. a building with a marina
// gets an "Aquatic & Marina" category, one without doesn't).
//
// On any failure, returns the input unchanged so downstream code still works.
async function categorizeAmenities(flatAmenities, buildingName) {
  if (!Array.isArray(flatAmenities) || flatAmenities.length === 0) return flatAmenities || [];
  // If the input is already structured (has .category keys), pass through.
  if (typeof flatAmenities[0] === 'object' && flatAmenities[0]?.category) return flatAmenities;
  if (!process.env.ANTHROPIC_API_KEY) return flatAmenities;

  const numbered = flatAmenities.map((a, i) => (i + 1) + '. ' + a).join('\n');
  const prompt = [
    'You are organizing an amenity list for a luxury real estate building.',
    'Group the amenities below into 4-6 logical categories with appropriate emoji icons.',
    '',
    'COMMON CATEGORIES (pick ones that fit; not all required, others may be needed):',
    '- "Aquatic & Marina"  🏊  (pools, cabanas, boat slips, marinas, water features)',
    '- "Wellness & Fitness"  🧘  (spa, gym, yoga, sauna, steam, treatment rooms)',
    '- "Dining"  🍽️  (restaurants, bars, room service, private dining)',
    '- "Outdoor & Recreation"  🌳  (gardens, courts, playgrounds, cinemas, BBQ)',
    '- "Social & Work"  🎯  (lounges, libraries, business centers, ballrooms, simulators)',
    '- "Building Services"  🏢  (concierge, valet, parking, EV, app, lobby, security)',
    '',
    'Building: ' + (buildingName || 'unknown'),
    '',
    'AMENITIES (' + flatAmenities.length + '):',
    numbered,
    '',
    'Return ONLY valid JSON in this exact shape (no markdown, no backticks, no commentary):',
    '[',
    '  {"category":"Aquatic & Marina","icon":"🏊","items":["amenity 1","amenity 2"]},',
    '  {"category":"Wellness & Fitness","icon":"🧘","items":["amenity 3"]}',
    ']',
    '',
    'EVERY amenity from the input must appear in EXACTLY ONE category. Use the amenity strings VERBATIM — do not paraphrase, shorten, or rewrite them. If an amenity does not fit any common category, create a new appropriately-named one.',
  ].join('\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      console.warn('[categorizeAmenities] API error', r.status, '— passing through unchanged');
      return flatAmenities;
    }
    const j = await r.json();
    const text = (j.content || []).map(c => c.text || '').join('');
    // Strip code fences if Claude added them despite the instruction
    const cleaned = text.replace(/^```(?:json)?/im, '').replace(/```$/m, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.warn('[categorizeAmenities] no array in response — passing through');
      return flatAmenities;
    }
    const categorized = JSON.parse(match[0]);
    if (!Array.isArray(categorized) || categorized.length === 0) {
      console.warn('[categorizeAmenities] empty result — passing through');
      return flatAmenities;
    }
    // Sanity check: every input amenity should appear in some category's items
    const seen = new Set(categorized.flatMap(c => c.items || []));
    const missing = flatAmenities.filter(a => !seen.has(a));
    if (missing.length > 0) {
      // Append missing ones to a "Other" category so we never lose data
      console.warn('[categorizeAmenities] adding', missing.length, 'missing amenities to Other category');
      categorized.push({ category: 'Other', icon: '✨', items: missing });
    }
    console.log('[categorizeAmenities] organized', flatAmenities.length, 'amenities into', categorized.length, 'categories');
    return categorized;
  } catch (e) {
    console.warn('[categorizeAmenities] exception:', e.message, '— passing through');
    return flatAmenities;
  }
}

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
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

function extractPDFs(html, baseUrl) {
  // Find every <a href> pointing to a .pdf — categorize by filename keywords.
  // Returns: [{ url, name, kind }] where kind is 'floorPlan' | 'brokerDoc'.
  const map = new Map();
  try {
    const origin = new URL(baseUrl);
    for (const m of html.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi)) {
      let url = m[1];
      if (url.startsWith('//'))      url = 'https:' + url;
      else if (url.startsWith('/'))  url = origin.protocol + '//' + origin.host + url;
      else if (!url.startsWith('http')) continue;
      if (map.has(url)) continue;
      const lower = url.toLowerCase();
      // Skip non-marketing junk
      if (/wp-includes|wp-json|cookie|privacy|terms|disclaimer|legal|gdpr|accessibility/.test(lower)) continue;
      // Decode + clean filename for the human-readable name
      const filename = decodeURIComponent(url.split('/').pop().split('?')[0])
        .replace(/\.pdf$/i, '')
        .replace(/[-_+]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const kind = /floor.?plan|floorplan|residence.?plan|unit.?plan|layout|stack/i.test(lower) ? 'floorPlan' : 'brokerDoc';
      map.set(url, { url, name: filename || 'Document', kind });
    }
  } catch {}
  return Array.from(map.values());
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
      if (BLOCK_PATTERNS.test(check) || SKIP_DOMAIN.test(url)) continue;
      if (/\d+x\d+/.test(url) && url.includes('thumbnail')) continue;
      let cat = categorizeImage(check);
      if (!cat) cat = categorizeFromPath(baseUrl);
      if (!cat) continue; // dropped — neither filename nor page slug recognized
      map.set(url, { url, caption: alt.substring(0, 120), category: cat });
    }
    for (const m of html.matchAll(/url\(["']?(https?:\/\/[^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi)) {
      let url = m[1].replace(/-\d+x\d+(\.(?:jpg|jpeg|png|webp))$/i, '$1');
      if (map.has(url)) continue;
      const check = url.toLowerCase();
      if (BLOCK_PATTERNS.test(check) || SKIP_DOMAIN.test(url)) continue;
      let cat = categorizeImage(check);
      if (!cat) cat = categorizeFromPath(baseUrl);
      if (!cat) continue; // CSS background — dropped if neither filename nor page slug helps
      map.set(url, { url, caption: '', category: cat });
    }
  } catch {}
  return Array.from(map.values()).filter(i => !i.url.includes('base64') && !i.url.includes('placeholder'));
}

// Pull canonical page URLs and inline image references from a Yoast/WordPress
// sitemap. Many WordPress real-estate sites (Alba, Berkeley, etc.) generate
// these, and they list every page on the site PLUS the images on each page —
// including JS-rendered ones the scraper can't otherwise see. A massive quality
// lever with zero token cost.
async function discoverFromSitemap(host, base) {
  const tryUrls = [
    base.protocol + '//' + host + '/sitemap_index.xml',
    base.protocol + '//' + host + '/sitemap.xml',
  ];

  let xml = null;
  for (const u of tryUrls) {
    const fetched = await fetchPage(u);
    if (fetched && fetched.includes('<')) { xml = fetched; break; }
  }
  if (!xml) return { pages: [], images: [] };

  // sitemap_index.xml is a sitemap-of-sitemaps — recurse one level
  let pageXml = xml;
  const subMatches = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<]+?)\s*<\/loc>[\s\S]*?<\/sitemap>/gi)];
  if (subMatches.length > 0) {
    const subUrls = subMatches.map(m => m[1].trim()).slice(0, 5);
    const subXmls = await Promise.all(subUrls.map(u => fetchPage(u)));
    pageXml = subXmls.filter(Boolean).join('\n');
  }

  const pages = new Set();
  const imgMap = new Map();

  // Skip patterns reused below — same as elsewhere in the file
  const SKIP_PATH = /\/(privacy|terms|disclaimer|cookie|accessibility|broker-portal|login|register|cart|account|legal|thank-you|inquire|schedule|sitemap|view-digital-brochure|wp-|winter|holiday|404)/i;

  // Each <url> block lists one page and zero or more <image:loc> tags
  for (const block of pageXml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const blockText = block[1];
    const locMatch = blockText.match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    if (!locMatch) continue;
    try {
      const parsed = new URL(locMatch[1].trim());
      if (parsed.hostname !== host) continue;
      if (SKIP_PATH.test(parsed.pathname)) continue;
      pages.add(parsed.protocol + '//' + parsed.host + parsed.pathname);
    } catch { continue; }

    // Pre-discovered images (Yoast tracks JS-rendered ones server-side)
    for (const im of blockText.matchAll(/<image:loc>\s*([^<]+?)\s*<\/image:loc>/gi)) {
      const imgUrl = im[1].trim();
      if (imgMap.has(imgUrl)) continue;
      const lower = imgUrl.toLowerCase();
      if (BLOCK_PATTERNS.test(lower) || SKIP_DOMAIN.test(imgUrl)) continue;
      let cat = categorizeImage(lower);
      if (!cat) cat = categorizeFromPath(locMatch[1].trim());
      if (!cat) continue; // drop if neither filename nor page slug recognized
      imgMap.set(imgUrl, { url: imgUrl, caption: '', category: cat });
    }
  }

  return { pages: Array.from(pages), images: Array.from(imgMap.values()) };
}

export default async function handler(req, res) {
  // Writes / AI calls require the shared admin token — see api/_auth.js.
  if (!requireNcAuth(req, res)) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const base = new URL(url.startsWith('http') ? url : 'https://' + url);
    const host = base.hostname;

    // STEP 1: Try the site's sitemap first — gives us canonical page URLs
    // AND inline image references (including JS-rendered ones). Big quality win
    // for WordPress sites that use Yoast SEO (Alba, Berkeley, most luxury condo
    // marketing sites).
    const sitemap = await discoverFromSitemap(host, base);
    console.log('[Research] Sitemap discovered', sitemap.pages.length, 'pages and', sitemap.images.length, 'images');

    // STEP 2: Build the URL list to fetch.
    //  - If sitemap gave us pages, prefer those (authoritative for that site)
    //  - Otherwise fall back to hardcoded seed paths + home-page link discovery
    let allUrls;
    if (sitemap.pages.length >= 4) {
      // Always include the home page even if not explicitly in sitemap
      const set = new Set([base.protocol + '//' + host + '/']);
      for (const u of sitemap.pages) set.add(u);
      allUrls = Array.from(set).slice(0, 14);
    } else {
      // Hardcoded seed paths (legacy fallback for sites without sitemaps)
      const seedPaths = [
        '/', '/residences', '/amenities', '/team', '/contact', '/location',
        '/gallery', '/photo-gallery', '/floor-plans', '/floorplans', '/availability', '/media',
      ];
      const seedUrls = new Set(seedPaths.map(p => base.protocol + '//' + host + p));

      // Discover internal links from the home page nav, but ONLY those that look
      // gallery/floor-plan/residence-related to keep the prompt budget bounded.
      const RELEVANT_PATH = /(gallery|photo|residence|floor.?plan|floorplan|the.?home|interior|amenit|tower|building|suite)/i;
      const SKIP_PATH     = /(privacy|terms|disclaimer|cookie|accessibility|sitemap|broker-portal|login|register|appointment|subscribe|cart|account|legal|press|news|blog|post|category|tag|author|wp-)/i;

      const homeUrl  = base.protocol + '//' + host + '/';
      const homeHtml = await fetchPage(homeUrl);
      if (homeHtml) {
        for (const m of homeHtml.matchAll(/href=["']([^"'#?]+)["']/gi)) {
          let u = m[1];
          if (!u || u.startsWith('mailto:') || u.startsWith('tel:') || /\.(pdf|jpg|jpeg|png|webp|gif|svg|css|js|zip|mp4)(\?|$)/i.test(u)) continue;
          if (u.startsWith('/'))      u = base.protocol + '//' + host + u;
          else if (!u.startsWith('http')) continue;
          try {
            const parsed = new URL(u);
            if (parsed.hostname !== host) continue;
            const path = parsed.pathname.toLowerCase();
            if (SKIP_PATH.test(path))      continue;
            if (!RELEVANT_PATH.test(path)) continue;
            const clean = parsed.protocol + '//' + parsed.host + parsed.pathname;
            seedUrls.add(clean.endsWith('/') ? clean : clean + '/');
          } catch {}
        }
      }
      allUrls = Array.from(seedUrls).slice(0, 14);
    }

    console.log('[Research] Fetching', allUrls.length, 'pages from', host);
    const pages = await Promise.all(allUrls.map(async (pageUrl) => {
      const html = await fetchPage(pageUrl);
      if (!html) return null;
      return {
        url: pageUrl,
        text: toText(html).substring(0, 2500),
        images: extractImages(html, pageUrl),
        pdfs: extractPDFs(html, pageUrl),
      };
    }));

    const validPages = pages.filter(Boolean);
    // Combine images from all sources: scraped HTML + Yoast sitemap inline tags.
    // Sitemap images are critical because they include JS-rendered content the
    // static fetch can't otherwise see.
    const scrapedImgs = validPages.flatMap(p => p.images);
    const allImagesMap = new Map();
    for (const img of [...scrapedImgs, ...sitemap.images]) {
      if (!allImagesMap.has(img.url)) allImagesMap.set(img.url, img);
    }
    const allImages = Array.from(allImagesMap.values());
    console.log('[Research] images: scraped=' + scrapedImgs.length + ' sitemap=' + sitemap.images.length + ' merged=' + allImages.length);

    // Merge PDFs across all scraped pages. Many sites bury the broker package
    // in a footer link or press kit page — this catches those static <a> tags.
    const pdfMap = new Map();
    for (const p of validPages) {
      for (const pdf of (p.pdfs || [])) {
        if (!pdfMap.has(pdf.url)) pdfMap.set(pdf.url, pdf);
      }
    }
    const allPDFs = Array.from(pdfMap.values());
    console.log('[Research] PDFs found:', allPDFs.length);
    console.log('[Research]', validPages.length, 'pages,', allImages.length, 'images');

    const siteContent = validPages.map(p => '\n=== ' + p.url + ' ===\n' + p.text).join('\n\n').substring(0, 12000);
    const imageList   = allImages.slice(0, 50).map(i => i.url + ' [' + i.category + '] ' + i.caption).join('\n');

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
      'Return ONLY valid JSON (no markdown, no backticks, no <cite> tags or citations of any kind around values).',
      'CRITICAL: Every string value MUST be wrapped in double quotes — including company names, person names, and any value with spaces or special characters. Never write "developer": BGI Companies — always write "developer": "BGI Companies". Numbers and null are unquoted; everything else needs quotes.',
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

    while (!finalText && itr < 3) {
      itr++;
      console.log('[Research] iteration', itr);

      const payload = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
        console.error('[Research] API error', apiRes.status, errText.substring(0, 400));
        let detail = '';
        try {
          const errJson = JSON.parse(errText);
          detail = errJson?.error?.message || errJson?.message || errText.substring(0, 300);
        } catch { detail = errText.substring(0, 300); }
        return res.status(500).json({
          error: 'Anthropic API ' + apiRes.status + ': ' + detail,
          iteration: itr,
        });
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

    // The Anthropic web_search tool auto-wraps values in <cite> tags. These break JSON.parse.
    // Strip any tag with the form <cite ...>...</cite> (or self-closing) before parsing.
    // Also strip ... in case the namespaced form leaks through.
    const stripCitations = (s) => s
      .replace(/<\/?(?:antml:)?cite[^>]*>/g, '')
      .replace(/<\/?(?:antml:)?source[^>]*>/g, '');

    const cleaned = stripCitations(finalText);
    const match = cleaned.match(/\{[\s\S]+\}/);
    if (!match) return res.status(500).json({ error: 'No JSON in response', preview: cleaned.substring(0, 300) });

    // Try parse; if it fails, attempt repairs for the most common Claude mistakes
    function tryRepair(s) {
      // 1. Wrap unquoted identifier values like:  "developer": BGI Companies, "next": ...
      //    into:  "developer": "BGI Companies", "next": ...
      // Match a key ":" then a non-quoted, non-{[ value that runs until comma or newline before next key.
      let repaired = s.replace(
        /"([A-Za-z_]\w*)"\s*:\s*([A-Za-z][^,\n}\]]*?)\s*(?=,\s*"[A-Za-z_]|\s*[}\]])/g,
        (m, key, value) => {
          const v = value.trim();
          // Skip values that are already valid JSON literals
          if (v === 'null' || v === 'true' || v === 'false') return m;
          if (/^-?\d+(\.\d+)?$/.test(v)) return m;
          // Wrap with quotes, escape any internal quotes
          return '"' + key + '": "' + v.replace(/"/g, '\\"') + '"';
        }
      );
      // 2. Trailing commas before } or ]
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      return repaired;
    }

    let building;
    let parseAttempts = [];
    try { building = JSON.parse(match[0]); parseAttempts.push('first-pass'); }
    catch (e1) {
      parseAttempts.push('first-pass-failed: ' + e1.message);
      try {
        const repaired = tryRepair(match[0]);
        building = JSON.parse(repaired);
        parseAttempts.push('repaired-ok');
        console.log('[Research] JSON parse succeeded after repair');
      } catch (e2) {
        parseAttempts.push('repair-failed: ' + e2.message);
        return res.status(500).json({
          error: 'JSON parse failed even after repair: ' + e2.message,
          firstError: e1.message,
          attempts: parseAttempts,
          preview: match[0].substring(0, 800),
        });
      }
    }

    // Build the final image pool. We deliberately IGNORE building.images here —
    // Claude tends to cherry-pick only 5-10 images even when given 50, since
    // it's optimizing output token count. Our scraped+sitemap pool has the full
    // set already correctly categorized via filename heuristics, so just use
    // that. If Claude returned captions for any URLs, merge those in.
    const claudeCaptions = new Map();
    for (const img of (building.images || [])) {
      if (img.url && img.caption) claudeCaptions.set(img.url, img.caption);
    }

    // Priority order — Floor Plans first (so they always make the cut),
    // then high-value content categories, then everything else last.
    const CATEGORY_PRIORITY = {
      'Floor Plans': 0,
      'Exterior':    1,
      'Residences':  2,
      'Amenities':   3,
      'Views':       4,
      'Arrival':     5,
    };

    const sortedImages = [...allImages].sort((a, b) => {
      const pa = CATEGORY_PRIORITY[a.category] ?? 9;
      const pb = CATEGORY_PRIORITY[b.category] ?? 9;
      return pa - pb;
    }).slice(0, 20); // hard cap at 20 — user spec; floor plans + top categories prioritized first

    // Split into floor plans vs renderings, applying any Claude captions
    const isFloorPlan = i => i.category === 'Floor Plans';
    const floorPlanItems = sortedImages.filter(isFloorPlan).map(i => ({
      name:  claudeCaptions.get(i.url) || i.caption ||
             (i.url.split('/').pop() || 'Floor Plan').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      thumb: i.url,
      pdf:   i.url,
    }));
    const renderingItems = sortedImages.filter(i => !isFloorPlan(i)).map(i => ({
      url:      i.url,
      caption:  claudeCaptions.get(i.url) || i.caption || '',
      category: i.category,
    }));

    // Merge in PDFs discovered via static <a href> link extraction:
    //  - filename-categorized 'floorPlan' PDFs append to floorPlanImages
    //  - everything else appends to brokerDocs (broker toolkit)
    // Note: many luxury sites JS-render their downloads pages — for those,
    // this returns empty and the user uploads manually via Files & Media.
    const pdfFloorPlans = allPDFs.filter(p => p.kind === 'floorPlan').map(p => ({
      name:  p.name,
      thumb: p.url,
      pdf:   p.url,
    }));
    const pdfBrokerDocs = allPDFs.filter(p => p.kind === 'brokerDoc').map(p => ({
      name: p.name,
      type: 'document',
      url:  p.url,
    }));

    // ---- AI post-processing pass ---------------------------------------
    // Two refinements to the scraped/captioned data before we hand it back
    // to the client:
    //   1. filterPeopleImages — drop lifestyle shots where humans are the focus.
    //      Filename heuristics caught the obvious cases earlier; this catches
    //      the subtle "couple at the pool" / "model in the lobby" shots that
    //      slip past pattern matching.
    //   2. categorizeAmenities — convert the flat amenity list Claude returned
    //      into the structured [{category, icon, items}] shape the UI expects.
    // Both pass through unchanged on any error (logged), so a failure here
    // never blocks a successful research result.
    const filteredRenderings = await filterPeopleImages(renderingItems, building.suggestedName);
    const structuredAmenities = await categorizeAmenities(building.amenities || [], building.suggestedName);

    building.renderings      = filteredRenderings;
    building.amenities       = structuredAmenities;
    building.floorPlanImages = [...floorPlanItems, ...pdfFloorPlans];
    building.brokerDocs      = pdfBrokerDocs;
    building.pagesScraped    = validPages.length;
    building.rawImageCount   = allImages.length;
    building.rawPDFCount     = allPDFs.length;

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
      floorPlanImages:   building.floorPlanImages || [],
      floorPlans:        [],
      brokerDocs:        building.brokerDocs || [],
    };

    console.log('[Research] OK:', project.suggestedName,
      '| renderings:', project.renderings.length,
      '| floor plans:', project.floorPlanImages.length,
      '| broker docs:', project.brokerDocs.length,
      '| iterations:', itr);
    return res.status(200).json({ project });

  } catch (err) {
    console.error('[Research] Fatal:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
