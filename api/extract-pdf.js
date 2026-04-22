// api/extract-pdf.js
// Receives a PDF as base64, sends to Claude to extract all real estate data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64, filename, existingData } = req.body;
  if (!pdfBase64) return res.status(400).json({ error: 'pdfBase64 is required' });

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              }
            },
            {
              type: 'text',
              text: `You are extracting data from a luxury real estate PDF document (filename: "${filename || 'document.pdf'}").
${existingData ? `\nExisting data already scraped from the website:\n${JSON.stringify(existingData, null, 2)}\n` : ''}
Extract everything you can find in this PDF and return ONLY a valid JSON object with any of these fields that are present:

- suggestedName: Building name if found
- address: Street address
- phone: Phone number formatted as "561.XXX.XXXX"
- email: Email address
- website: Website domain
- developer: Developer company name
- architect: Architect firm name
- interiorDesigner: Interior designer firm name
- contractor: General contractor
- management: Property management company
- salesBroker: Sales brokerage
- landscape: Landscape architect
- totalUnits: Total number of units (integer)
- totalFloors: Number of floors (integer)
- priceRange: Price range e.g. "$1.95M – $8M+"
- priceFrom: Starting price as number e.g. 1950000
- priceTo: Top price as number e.g. 8000000
- unitSizeRange: Size range e.g. "1,483 – 4,110 SF"
- bedrooms: Bedroom range e.g. "2–4 Bedrooms"
- status: Exactly one of: "Pre-Construction / Sales Launched", "Under Construction", "Completed"
- salesLaunch: e.g. "January 2024"
- estimatedDelivery: e.g. "Q1 2028"
- constructionStart: e.g. "March 2024"
- constructionLoan: e.g. "$380M — GoldenTree Asset Management"
- depositStructure: Array of strings e.g. ["10% at Reservation", "10% at Contract", "80% at Closing"]
- leedCertified: e.g. "LEED Gold"
- views: Views available from residences
- parking: Parking details
- locationNote: Location/neighborhood description
- amenitiesSF: Amenity space e.g. "80,000+ SF"
- siteSF: Site area e.g. "4 acres"
- keyFacts: Array of 5-8 key facts found in the document
- floorPlans: Array of floor plan objects found, each with: { name, beds, baths, interiorSF, terraceSF, priceFrom, tier, exposure }
  Example: { name: "Model A", beds: "2 Bed", baths: "2.5 Bath", interiorSF: 1483, terraceSF: 354, priceFrom: 1950000, tier: "2BR", exposure: "South" }

Only include fields you actually find in the document. If a field is not present, omit it entirely.
Return ONLY the JSON object. No explanation. No markdown backticks.`
            }
          ]
        }]
      })
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      return res.status(500).json({ error: 'AI error: ' + (err.error?.message || JSON.stringify(err)) });
    }

    const aiData = await aiRes.json();
    const aiText = aiData.content?.[0]?.text || '';
    const jsonMatch = aiText.match(/\{[\s\S]+\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response', raw: aiText.substring(0, 200) });
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, extracted, filename });

  } catch (err) {
    console.error('extract-pdf error:', err);
    return res.status(500).json({ error: err.message });
  }
}
