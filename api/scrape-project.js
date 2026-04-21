// api/scrape-project.js
// Serverless function — fetches a project website and extracts building data.
// Returns a partially-filled project object for the CMS form to review/complete.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    // Fetch the main page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': url,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch ${url}: ${response.status}` });
    }

    const html = await response.text();

    // Extract images
    const imageMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi);
    const images = [];
    const seenUrls = new Set();

    for (const match of imageMatches) {
      let imgUrl = match[1];
      const alt = match[2] || '';

      // Skip tiny images, icons, SVGs, data URIs
      if (imgUrl.startsWith('data:')) continue;
      if (imgUrl.includes('.svg')) continue;
      if (imgUrl.includes('logo') && imgUrl.includes('.svg')) continue;
      if (imgUrl.includes('icon')) continue;

      // Make absolute
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      else if (imgUrl.startsWith('/')) {
        const base = new URL(url);
        imgUrl = `${base.protocol}//${base.host}${imgUrl}`;
      }

      if (seenUrls.has(imgUrl)) continue;
      seenUrls.add(imgUrl);

      // Try to categorize
      const lower = (imgUrl + alt).toLowerCase();
      let category = 'Exterior';
      if (lower.includes('pool') || lower.includes('amenity') || lower.includes('gym') || lower.includes('fitness') || lower.includes('spa') || lower.includes('yoga') || lower.includes('lounge')) category = 'Amenities';
      else if (lower.includes('living') || lower.includes('kitchen') || lower.includes('bedroom') || lower.includes('bath') || lower.includes('interior') || lower.includes('residence') || lower.includes('int')) category = 'Residences';
      else if (lower.includes('view') || lower.includes('aerial') || lower.includes('intracoastal') || lower.includes('ocean')) category = 'Views';
      else if (lower.includes('lobby') || lower.includes('arrival') || lower.includes('entrance')) category = 'Arrival';
      else if (lower.includes('din') || lower.includes('restaurant') || lower.includes('food')) category = 'Dining';
      else if (lower.includes('marina') || lower.includes('boat') || lower.includes('dock')) category = 'Marina';

      images.push({
        url: imgUrl,
        caption: alt || '',
        category,
      });
    }

    // Extract PDFs
    const pdfMatches = html.matchAll(/href=["']([^"']+\.pdf)["']/gi);
    const pdfs = [];
    const seenPdfs = new Set();

    for (const match of pdfMatches) {
      let pdfUrl = match[1];
      if (pdfUrl.startsWith('/')) {
        const base = new URL(url);
        pdfUrl = `${base.protocol}//${base.host}${pdfUrl}`;
      }
      if (seenPdfs.has(pdfUrl)) continue;
      seenPdfs.add(pdfUrl);

      // Try to name it
      const filename = pdfUrl.split('/').pop().replace(/[-_]/g, ' ').replace('.pdf', '').trim();
      const isFloorPlan = /floor|plan|layout|unit/i.test(filename);

      pdfs.push({
        url: pdfUrl,
        name: filename,
        type: isFloorPlan ? 'floorplan' : 'brokerDoc',
      });
    }

    // Extract text for contact info
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    // Phone numbers
    const phoneMatch = textContent.match(/\b(?:\d{3}[-.]?\d{3}[-.]?\d{4}|\(\d{3}\)\s*\d{3}[-.]?\d{4}|\d{3}\.\d{3}\.\d{4})\b/g);
    const phones = phoneMatch ? [...new Set(phoneMatch)].slice(0, 2) : [];

    // Email
    const emailMatch = textContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : null;

    // Price — look for "$X.XM" or "from $X,XXX,XXX" patterns
    const priceMatch = textContent.match(/\$[\d,]+(?:\.\d+)?(?:\s*[Mm]illion)?/g);
    const prices = priceMatch ? [...new Set(priceMatch)].slice(0, 3) : [];

    // Address — look for "N Flagler" or common WPB patterns
    const addressMatch = textContent.match(/\d+\s+[NSEW]?\.?\s+(?:Flagler|Dixie|Rosemary|Palm Beach|Okeechobee)[^,\n]+(?:,\s*West Palm Beach[^,\n]*)?/i);
    const address = addressMatch ? addressMatch[0].trim() : null;

    // Title / name
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\|.*/, '').trim() : '';

    // Generate an id from the URL
    const urlObj = new URL(url);
    const suggestedId = urlObj.hostname
      .replace('www.', '')
      .replace(/\.(com|net|org|io).*/, '')
      .replace(/[^a-z0-9]/g, '');

    const result = {
      suggestedId,
      suggestedName: title,
      address,
      phone: phones[0] || null,
      phone2: phones[1] || null,
      email,
      website: urlObj.hostname.replace('www.', ''),
      pricesFound: prices,
      images: images.slice(0, 80), // cap at 80
      pdfs,
      rawImageCount: images.length,
    };

    return res.status(200).json(result);

  } catch (err) {
    console.error('scrape-project error:', err);
    return res.status(500).json({ error: err.message });
  }
}
