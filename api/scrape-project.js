// api/scrape-project.js
// Deep multi-page scraper — visits home, amenities, residences, team, contact pages
// and extracts everything it can to pre-fill the Add Building form.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Referer': url },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function toText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

function extractImages(html, base) {
  const map = new Map();
  const origin = new URL(base);

  // img src
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi)) {
    let url = m[1]; const alt = m[2] || '';
    if (url.startsWith('data:') || url.includes('.svg')) continue;
    if (url.startsWith('//')) url = 'https:' + url;
    else if (url.startsWith('/')) url = `${origin.protocol}//${origin.host}${url}`;
    else if (!url.startsWith('http')) continue;
    // Remove WordPress size suffix to get full image
    url = url.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
    if (map.has(url)) continue;
    const lower = (url + alt).toLowerCase();
    let cat = 'Exterior';
    if (/pool|amenity|gym|fitness|spa|yoga|lounge|rooftop|bowling|pickleball|wellness/.test(lower)) cat = 'Amenities';
    else if (/living|kitchen|bedroom|bath|interior|residence|terrace|balcon/.test(lower)) cat = 'Residences';
    else if (/view|aerial|intracoastal|ocean|skyline/.test(lower)) cat = 'Views';
    else if (/lobby|arrival|entrance/.test(lower)) cat = 'Arrival';
    map.set(url, { url, caption: alt, category: cat });
  }

  // CSS background-image
  for (const m of html.matchAll(/url\(['"]?(https?:\/\/[^'"\)]+\.(?:jpg|jpeg|png|webp)[^'"\)]*?)['"]?\)/gi)) {
    const url = m[1].replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
    if (!map.has(url) && !url.includes('logo') && !url.includes('icon')) {
      map.set(url, { url, caption: '', category: 'Exterior' });
    }
  }

  return Array.from(map.values()).filter(i => !i.url.includes('placeholder') && !i.url.includes('base64'));
}

function extractPDFs(html, base) {
  const seen = new Set(); const pdfs = [];
  const origin = new URL(base);
  for (const m of html.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi)) {
    let url = m[1];
    if (url.startsWith('/')) url = `${origin.protocol}//${origin.host}${url}`;
    if (seen.has(url)) continue; seen.add(url);
    const name = decodeURIComponent(url.split('/').pop()).replace(/[-_+]/g,' ').replace('.pdf','').trim();
    pdfs.push({ url, name, type: /floor|plan|layout|unit|residence/i.test(name+url) ? 'floorplan' : 'brokerDoc' });
  }
  return pdfs;
}

function getLinks(html, base) {
  const origin = new URL(base); const links = new Set();
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    let url = m[1];
    if (!url || url.startsWith('mailto:') || url.startsWith('tel:') || url.match(/\.(pdf|jpg|png|webp|gif)$/i)) continue;
    if (url.startsWith('/')) url = `${origin.protocol}//${origin.host}${url}`;
    else if (!url.startsWith('http')) continue;
    try { if (new URL(url).hostname === origin.hostname) links.add(url); } catch {}
  }
  return Array.from(links);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    // Clean and normalize URL
    const rawUrl = url.trim().split(/\s/)[0];
    const baseUrl = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
    const base = new URL(baseUrl);
    const hostname = base.hostname.replace('www.', '');

    // Fetch home page first
    const homeHtml = await fetchPage(baseUrl);
    if (!homeHtml) return res.status(400).json({ error: `Could not fetch ${baseUrl}` });

    // Discover and fetch sub-pages
    const allLinks = getLinks(homeHtml, baseUrl);
    const keywords = ['amenities', 'residences', 'team', 'contact', 'features', 'floorplan', 'location', 'about'];
    const toFetch = [baseUrl];
    for (const kw of keywords) {
      const match = allLinks.find(l => l.toLowerCase().includes(kw));
      if (match && !toFetch.includes(match)) toFetch.push(match);
      if (toFetch.length >= 6) break;
    }

    // Fetch all pages in parallel
    const htmlPages = await Promise.all(toFetch.map(u => fetchPage(u)));
    const validPages = htmlPages.filter(Boolean);
    const allHtml = validPages.join('\n');
    const text = toText(allHtml);

    // --- EXTRACT EVERYTHING ---

    // Images
    const imgMap = new Map();
    for (const html of validPages) {
      for (const img of extractImages(html, baseUrl)) {
        if (!imgMap.has(img.url)) imgMap.set(img.url, img);
      }
    }
    const images = Array.from(imgMap.values()).slice(0, 80);

    // PDFs
    const pdfs = extractPDFs(allHtml, baseUrl);

    // Contact
    const phones = [...new Set((text.match(/\b\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || []))].slice(0, 2);
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    const email = emailMatch && !emailMatch[0].includes('wpenginepowered') ? emailMatch[0] : null;
    // Match street address - require it starts with a building number (2-5 digits max, not a phone)
    const addrMatch = text.match(/\b(\d{1,5})\s+[A-Z][A-Za-z0-9\s.]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Highway|Hwy|Railroad)[^,\n]{0,30}(?:,\s*(?:Suite|Ste|#)[^,\n]{0,20})?(?:,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})?/);
    const address = addrMatch ? addrMatch[0].trim() : null;

    // Building name & tagline
    const titleMatch = homeHtml.match(/<title>([^<]+)<\/title>/i);
    const suggestedName = titleMatch ? titleMatch[1].replace(/\|.*/, '').replace(/[-–].*/, '').trim() : '';
    const h1Match = homeHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const tagline = h1Match ? h1Match[1].trim() : '';

    // Status
    let status = 'Pre-Construction / Sales Launched';
    if (/under construction|now building|construction underway/i.test(text)) status = 'Under Construction';
    else if (/completed?|move.?in ready|now open/i.test(text)) status = 'Completed';

    // Delivery
    const qMatch = text.match(/Q[1-4]\s*20\d\d/i);
    const yMatch = text.match(/(?:delivery|completion|expected|anticipated)[^.]{0,30}(20\d\d)/i);
    const estimatedDelivery = qMatch ? qMatch[0] : yMatch ? yMatch[1] : null;

    // Sales launch
    const salesMatch = text.match(/(?:sales\s+launched?|now\s+(?:selling|available)|open(?:ed)?\s+for\s+sales?)[^.]{0,40}((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})/i);
    const salesLaunch = salesMatch ? salesMatch[1] : null;

    // Team
    const devMatch = text.match(/(?:developed?\s+by|a\s+development\s+by|developer[:\s]+)\s*([A-Z][A-Za-z\s,+&.]{3,60}?)(?:\.|,|\n)/i);
    const developer = devMatch ? devMatch[1].trim().replace(/[,.]$/, '') : null;

    const archMatch = text.match(/(?:architect(?:ure|ed)?(?:\s+by)?|designed?\s+by)\s*([A-Z][A-Za-z\s,+&.]{3,60}?)(?:\.|,|\n)/i);
    const architect = archMatch ? archMatch[1].trim().replace(/[,.]$/, '') : null;

    const intMatch = text.match(/(?:interior\s+design(?:er|s)?(?:\s+by)?|interiors?\s+by)\s*([A-Z][A-Za-z\s,+&.]{3,60}?)(?:\.|,|\n)/i);
    const interiorDesigner = intMatch ? intMatch[1].trim().replace(/[,.]$/, '') : null;

    // Specs
    const unitsMatch = text.match(/(\d+)\s+(?:total\s+)?(?:condominium|condo|residential)?\s*(?:residences?|units?|homes?)/i);
    const totalUnits = unitsMatch ? parseInt(unitsMatch[1]) : null;

    const floorsMatch = text.match(/(\d+)[-\s]?(?:story|stories|floors?|levels?)\s+(?:tower|building)?/i);
    const totalFloors = floorsMatch ? parseInt(floorsMatch[1]) : null;

    // Pricing
    const priceMatches = text.match(/\$[\d,]+(?:\.\d+)?(?:\s*[Mm]illion|\s*[Mm])?/g) || [];
    const prices = [...new Set(priceMatches)].slice(0, 4);
    const priceRange = prices.length > 1 ? `${prices[0]} – ${prices[prices.length-1]}` : prices[0] || '';
    const priceFromMatch = (prices[0] || '').match(/[\d,.]+/);
    const priceFrom = priceFromMatch ? parseFloat(priceFromMatch[0].replace(/,/g,'')) : null;

    const sizeMatch = text.match(/(\d[\d,]*)\s*(?:to|–|-)\s*(?:over\s+)?(\d[\d,]+)\s*(?:square\s+feet|sq\.?\s*ft\.?|SF)/i);
    const unitSizeRange = sizeMatch ? `${sizeMatch[1]} – ${sizeMatch[2]} SF` : '';

    const bedMatch = text.match(/(\w[\w-]+)\s*(?:to|-)\s*(\w[\w-]+)\s*(?:bedroom|bed)/i) || text.match(/(\d)\s*(?:to|-)\s*(\d)\s*(?:bedroom|bed)/i);
    const bedrooms = bedMatch ? `${bedMatch[1]}–${bedMatch[2]} Bedrooms` : '';

    const igMatch = allHtml.match(/instagram\.com\/([A-Za-z0-9_.]+)/i);
    const instagram = igMatch ? `https://www.instagram.com/${igMatch[1]}/` : null;

    const suggestedId = hostname.replace(/\.(com|net|org|io).*/,'').replace(/[^a-z0-9]/g,'');

    return res.status(200).json({
      // Pre-filled project fields — these map directly to the form
      suggestedId,
      suggestedName,
      tagline,
      address,
      phone: phones[0] || null,
      phone2: phones[1] || null,
      email,
      instagram,
      website: base.hostname.replace('www.',''),
      status,
      salesLaunch,
      estimatedDelivery,
      developer,
      architect,
      interiorDesigner,
      totalUnits,
      totalFloors,
      priceRange,
      priceFrom,
      unitSizeRange,
      bedrooms,
      // Assets
      images,
      pdfs,
      pagesScraped: toFetch.length,
      rawImageCount: images.length,
    });

  } catch (err) {
    console.error('scrape error:', err);
    return res.status(500).json({ error: err.message });
  }
}
