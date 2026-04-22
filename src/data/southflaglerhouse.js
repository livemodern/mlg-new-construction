const southflaglerhouse = {
  id: "southflaglerhouse",
  name: "South Flagler House",
  subtitle: "Palm Beach Waterfront",
  tagline: "Your New Legacy Address — A Timeless Waterfront Masterpiece",
  status: "Pre-Construction / Sales Launched",
  salesLaunch: "2022",
  estimatedDelivery: "2026",

  // Contact
  address: "1355 South Flagler Drive, West Palm Beach, FL 33401",
  salesGallery: "221 Royal Poinciana Way, Suite #1, Palm Beach, FL 33480",
  phone: "561.782.6450",
  phone2: "561.867.9580",
  email: null,
  website: "southflaglerhouse.com",
  instagram: "https://www.instagram.com/southflaglerhouse/",
  facebook: "https://www.facebook.com/SouthFlaglerHouse/",
  factsheet: "https://related.widen.net/s/gkvpdjvgbg/sfh_fact-sheet_0625",

  // Building
  totalUnits: 108,
  totalFloors: 28,
  totalTowers: 2,
  siteAcreage: "3.4 acres",
  amenitySF: "50,000 SF",

  // Pricing (from website residence tiers — April 2026, plus broker intel)
  priceRange: "$7.48M – $72.5M",
  priceFrom: 7480000,
  priceTo: 72525000,
  unitSizeRange: "854 – 14,053 SF",
  bedrooms: "1–5 Bedrooms + Penthouses",

  // Market stats (MLS + public data as of April 2026)
  marketStats: {
    averagePrice: 18100000,
    averagePricePerSF: 3400,
    lowestPrice: 7480000,
    highestPrice: 72525000,
    activeListings: 20,
    note: "Very private pre-construction project — developer pricing rarely public. Stats drawn from MLS + in-person broker showing notes."
  },

  // Team
  developer: "Related Ross (Stephen M. Ross, Chairman)",
  architect: "Robert A.M. Stern Architects (RAMSA)",
  interiorDesigner: "Pembrooke & Ives",
  landscape: "SMI Landscape Architecture",
  salesBroker: "Corcoran Sunshine Marketing Group / The Corcoran Group",
  salesLeads: "Adam McPherson (Related Ross) & Suzanne Frisbie (The Corcoran Group)",
  contractor: "Rogers General Contracting (by Related Ross)",
  originalDeveloper: "Flagler Towers Project DEV LLC (originally Hines + The Frisbie Group, now Related Ross)",

  // Location
  locationNote: "Adjacent to the historic El Cid neighborhood on South Flagler Drive, across from Palm Beach Island's Worth Avenue, between the Intracoastal Waterway and downtown West Palm Beach. Minutes from Norton Museum of Art, CityPlace, Kravis Center, and Royal Poinciana Plaza.",
  views: "Intracoastal Waterway (Lake Worth Lagoon), Palm Beach Island, Atlantic Ocean, Downtown City Skyline",
  parking: "Private garage parking",
  towers: "Park Tower and Lake Tower — two 28-story structures rising from a shared stepped-garden base",

  // Residence tiers — pulled from website pricing section
  residenceTiers: [
    {
      name: "Floors 5-9",
      bedrooms: "1–4 BR",
      sqftRange: "854 – 5,385 SF",
      priceRange: "$16,650,000 – $23,500,000",
      priceFrom: 16650000,
      priceTo: 23500000,
      notes: "Private one-bedroom guest suites exclusive to owners. Select residences have private elevator access. Level 5 features expansive east-facing loggias at least 31 feet wide."
    },
    {
      name: "Floors 10-18",
      bedrooms: "2–4 BR",
      sqftRange: "2,592 – 5,173 SF",
      priceRange: "$7,980,000 – $34,500,000",
      priceFrom: 7980000,
      priceTo: 34500000,
      notes: "Select residences offer optional attached or detached guest house suites. Expansive loggias up to 23 ft deep and 31 ft wide."
    },
    {
      name: "Floors 19-20",
      bedrooms: "3–4 BR",
      sqftRange: "4,864 – 5,946 SF",
      priceRange: "$21,250,000 – $29,175,000",
      priceFrom: 21250000,
      priceTo: 29175000,
      notes: "All residences include private dining rooms and east-facing loggias. Select homes offer 10x30 ft west terrace and optional guest houses."
    },
    {
      name: "Penthouses (Floors 25-28)",
      bedrooms: "4–5 BR",
      sqftRange: "9,743 – 14,053 SF",
      priceRange: "$49,500,000 – $72,525,000",
      priceFrom: 49500000,
      priceTo: 72525000,
      notes: "Exclusive collection of four full-floor penthouses plus one duplex penthouse. Each uniquely designed."
    }
  ],

  // Detailed floor plans (from Drive — draft plans, subject to change)
  floorPlans: [
    { name: "Tier 1 South (Floors 6-9)", tower: "Park & Lake Tower", beds: 3, baths: "4 + Powder", interior: 5034, exterior: 551, tier: "Tier 1", notes: "Great Room 34'4\" x 28'4\", covered terrace, dining room, den" },
    { name: "Tier 1 North (Floors 6-9)", tower: "Park & Lake Tower", beds: 4, baths: "5 + Powder", interior: 5385, exterior: 551, tier: "Tier 1", notes: "Great Room (Living/Dining) 34'10\" x 33'6\", covered terrace. MLS shows 5,407 SF — minor variance from draft plan." },
    { name: "Tier 1 West (Floors 7-8)", tower: "Park Tower Only", beds: 2, baths: "2 + Powder", interior: 2181, exterior: 340, tier: "Tier 1", notes: "Terrace 9'9\" x 30', overlooks Norton Gallery" },
    { name: "Tier 1 Southwest Guest Suite (Floors 5-9)", tower: "Lake Tower Only", beds: 1, baths: 1, interior: 881, exterior: 170, tier: "Tier 1", notes: "Owner-exclusive guest suite. Terrace 10'4\" x 29'11\"" },
    { name: "Tier 2 North (Floors 12-18) — Park Tower", tower: "Park Tower Only", beds: 3, baths: "3 + Powder", interior: 4380, exterior: 446, tier: "Tier 2", notes: "Great Room 22' x 34', dining room, den, terrace 12' x 30'11\"" },
    { name: "Tier 2 North (Floors 12-18) — Lake Tower", tower: "Lake Tower Only", beds: 4, baths: "5 + Powder", interior: 5173, exterior: 425, tier: "Tier 2", notes: "Primary bedroom 18'10\" x 17', Great Room 22'10\" x 34', terrace, den" },
    { name: "Tier 2 South (Floors 12-18) — Park Tower", tower: "Park Tower Only", beds: 3, baths: "4 + Powder", interior: 4531, exterior: 425, tier: "Tier 2", notes: "Great Room 37'2\" x 24'4\", dining room 15'7\" x 19'3\", terrace 12' x 30'11\"" },
    { name: "Tier 2 South (Floors 12-18) — Lake Tower", tower: "Lake Tower Only", beds: 5, baths: "6 + Powder", interior: 6488, exterior: 765, tier: "Tier 2", notes: "Guest living suite, morning kitchen, Great Room 38'1\" x 24'5\", two terraces" },
    { name: "Tier 2 West (Floors 12-18)", tower: "Park Tower Only", beds: 2, baths: "2 + Powder", interior: 2582, exterior: 340, tier: "Tier 2", notes: "Office 9'9\" x 13', Great Room 16'7\" x 37'2\", terrace 9' x 37'" },
    { name: "Tier 3 North (Floors 21-24)", tower: "Lake & Park Tower", beds: 3, baths: "4 + Powder", interior: 4612, exterior: 445, tier: "Tier 3", notes: "Primary bedroom 17' x 17', Great Room 19' x 34'6\", terrace 11' x 37'9\", den" },
    { name: "Tier 3 South (Floors 21-24)", tower: "Lake & Park Tower", beds: 4, baths: "5 + Powder", interior: 5824, exterior: 785, tier: "Tier 3", notes: "Guest living suite with morning kitchen, family room/library 22'9\" x 17'3\", two terraces" }
  ],

  // Live MLS inventory — sourced from ModernLivingRE.com/south-flagler-house (April 2026)
  availableUnits: [
    { unit: "South Tower Duplex PH", floor: "27-28", tower: "Lake Tower", beds: 7, baths: 10, interior: 13904, price: 70000000, pricePerSF: 5034, status: "Active", matchedPlan: "Duplex Penthouse", notes: "MLS list $70M. Broker showing notes indicate developer pricing of $72,525,000." },
    { unit: "PH 2601", floor: 26, tower: "Lake Tower", beds: 4, baths: 6, interior: 8066, price: 39500000, pricePerSF: 4897, status: "Pending", matchedPlan: "Full-Floor Penthouse (Floor 26)" },
    { unit: "2203", floor: 22, tower: "Lake Tower", beds: 4, baths: 6, interior: 5743, price: 28450000, pricePerSF: 4955, status: "Active", matchedPlan: "Tier 3 South 21-24 (close — 5,824 SF plan)" },
    { unit: "800", floor: 8, tower: "Lake Tower", beds: 4, baths: 6, interior: 5355, price: 23500000, pricePerSF: 4389, status: "Active", matchedPlan: "Tier 1 North 6-9 (5,385/5,407 SF plan)" },
    { unit: "1900", floor: 19, tower: "Lake Tower", beds: 3, baths: 5, interior: 4862, price: 18850000, priceChange: "+$1,000,000", pricePerSF: 3878, status: "Pending", matchedPlan: "Floors 19-20 Tier (4,864-5,946 SF)" },
    { unit: "1601", floor: 16, tower: "Lake Tower", beds: 3, baths: 4, interior: 4380, price: 17500000, priceChange: "+$3,500,000", pricePerSF: 3995, status: "Active", matchedPlan: "Tier 2 North 12-18 (Park) — 4,380 SF" },
    { unit: "1700", floor: 17, tower: "Lake Tower", beds: 4, baths: 6, interior: 5173, price: 17250000, pricePerSF: 3334, status: "Pending", matchedPlan: "Tier 2 North 12-18 (Lake) — 5,173 SF" },
    { unit: "503", floor: 5, tower: "Lake Tower", beds: 3, baths: 5, interior: 4970, price: 16650000, pricePerSF: 3350, status: "Active", matchedPlan: "Tier 1 South 6-9 variant (close — 5,034 SF plan)" },
    { unit: "702", floor: 7, tower: "Park Tower", beds: 3, baths: 5, interior: 4436, price: 13795000, pricePerSF: 3110, status: "Active", matchedPlan: "Park Tower 3BR variant" },
    { unit: "1801", floor: 18, tower: "Lake Tower", beds: 3, baths: 4, interior: 4380, price: 13600000, priceChange: "+$400,000", pricePerSF: 3105, status: "Pending", matchedPlan: "Tier 2 North 12-18 (Park) — 4,380 SF" },
    { unit: "1001", floor: 10, tower: "Park Tower", beds: 4, baths: 5, interior: 4440, price: 13250000, pricePerSF: 2984, status: "Active", matchedPlan: "Park Tower 4BR variant (~4,440 SF)" },
    { unit: "1501-LT", floor: 15, tower: "Lake Tower", beds: 3, baths: 4, interior: 4380, price: 13190000, pricePerSF: 3011, status: "Pending", matchedPlan: "Tier 2 North 12-18 (Park) — 4,380 SF" },
    { unit: "402", floor: 4, tower: "Park Tower", beds: 4, baths: 5, interior: 4440, price: 11500000, priceChange: "-$2,200,000", pricePerSF: 2590, status: "Active", matchedPlan: "Park Tower 4BR variant (~4,440 SF)" },
    { unit: "1501-PT", floor: 15, tower: "Park Tower", beds: 4, baths: 5, interior: 4420, price: 10900000, priceChange: "-$3,095,000", pricePerSF: 2466, status: "Active", matchedPlan: "Park Tower 4BR variant (~4,420 SF)" },
    { unit: "2201", floor: 22, tower: "Park Tower", beds: 4, baths: 5, interior: 4420, price: 10900000, pricePerSF: 2466, status: "Active", matchedPlan: "Park Tower 4BR variant (~4,420 SF)" },
    { unit: "1201", floor: 12, tower: "Park Tower", beds: 4, baths: 5, interior: 4440, price: 9995000, priceChange: "-$3,255,000", pricePerSF: 2251, status: "Active", matchedPlan: "Park Tower 4BR variant (~4,440 SF)" },
    { unit: "201", floor: 2, tower: "Lake Tower", beds: 2, baths: 3, interior: 2811, price: 8935000, pricePerSF: 3178, status: "Active", matchedPlan: "Low-floor 2BR — no direct tier match" },
    { unit: "1405", floor: 14, tower: "Lake Tower", beds: 2, baths: 3, interior: 2592, price: 8550000, pricePerSF: 3299, status: "Active", matchedPlan: "Tier 2 West 12-18 — 2,592 SF" },
    { unit: "1505", floor: 15, tower: "Lake Tower", beds: 2, baths: 3, interior: 2592, price: 7930000, pricePerSF: 3061, status: "Pending", matchedPlan: "Tier 2 West 12-18 — 2,592 SF" },
    { unit: "103", floor: 1, tower: "Lake Tower", beds: 2, baths: 3, interior: 2301, price: 7480000, pricePerSF: 3251, status: "Pending", matchedPlan: "Low-floor 2BR — no direct tier match" }
  ],

  // Off-market / private pricing intel — from in-person sales gallery showing
  brokerIntel: {
    source: "In-person sales gallery showing notes",
    confidentiality: "This project is very private about pricing — developer pricing rarely made public. Intel below captured during a sales gallery visit.",
    privatePricing: [
      { unit: "Duplex Penthouse (Floors 27-28)", tower: "Lake Tower", price: 72525000, notes: "Top-of-building duplex penthouse. MLS lists $70M; actual developer pricing per showing is $72,525,000." },
      { unit: "Floor 23 (combined)", tower: "Lake Tower", price: 36641875, notes: "Combined full-floor residence on Floor 23. Not publicly listed." },
      { unit: "Penthouse Floor 25", tower: "Park Tower", price: 35880000, notes: "Park Tower full-floor penthouse. Not publicly listed." }
    ]
  },

  // Custom homes program
  customHomes: {
    name: "Rogers by Related Ross",
    description: "Turnkey custom home program delivered at closing. Rogers General Contracting works with buyers pre-closing to deliver fully customized residences built to the owner's exact standards."
  },

  // Amenities
  amenities: {
    swimAndSpa: [
      "25-meter Lap Pool with Sun Shelf",
      "Hot Tub",
      "Poolside Cabanas (lakefront)",
      "Men's Spa with Vitality Pool, Ice Plunge, Steam, Sauna, Changing & Locker Rooms",
      "Women's Spa with Vitality Pool, Ice Plunge, Steam, Sauna, Changing & Locker Rooms",
      "Spa Treatment Rooms",
      "Salon"
    ],
    sportsAndFitness: [
      "Pickleball Court and Lounge",
      "State-of-the-art Fitness Center",
      "Flexible Fitness Lounge",
      "Yoga Studio",
      "Pilates Studio",
      "Sports Simulator Lounge with Indoor Practice Green",
      "Outdoor Recreation Lawn Area",
      "Private Training Studio"
    ],
    foodAndBeverage: [
      "Residents-only Indoor and Outdoor Restaurant",
      "Entertainment Lounge with Catering Kitchen",
      "Party Room with Catering Kitchen",
      "Commercial Kitchen",
      "Private Dining Rooms",
      "Outdoor Dining Patio",
      "Wine Tasting Room with Wine Storage Lockers"
    ],
    business: [
      "Business Center",
      "Private Offices",
      "Indoor and Outdoor Conference Rooms"
    ],
    childrensRecreation: [
      "Indoor Playroom",
      "Children's Lounge with Kitchenette",
      "Craft Room",
      "Outdoor Butterfly Garden"
    ],
    socialAndEntertainment: [
      "Various Indoor and Outdoor Lounges",
      "Games Room (Ping Pong, Billiards, Foosball)",
      "Parlor with Library and Card Tables",
      "Theater",
      "Guest Suites (for owners' visitors)",
      "Courtyard Lounge"
    ],
    services: [
      "Related Life programming (curated events & experiences)",
      "Dedicated concierge team",
      "Artisan Home membership (post-closing home-care & maintenance)",
      "Customization & alterations support (closets, window treatments, A/V, lighting, Wi-Fi)",
      "Appliance warranty & preventative maintenance oversight",
      "Personalized point-of-contact service"
    ]
  },

  // Key facts
  keyFacts: [
    "Developed by Related Ross — led by Stephen M. Ross, Chairman",
    "Designed by Robert A.M. Stern Architects (RAMSA), inspired by historic Palm Beach estates",
    "Interiors by Pembrooke & Ives, landscape by SMI Landscape Architecture",
    "Two 28-story towers — Park Tower and Lake Tower — rising from a shared stepped-garden base",
    "108 residences total, 1-to-5 bedroom homes, penthouses, and owner-exclusive guest suites",
    "3.4-acre waterfront site with permanent unobstructed views of Lake Worth, Palm Beach Island, and the Atlantic Ocean",
    "50,000 SF of private club amenities — lakefront pool, full spa, restaurant, sports simulator, pickleball",
    "Exclusive sales by Adam McPherson (Related Ross) and Suzanne Frisbie (The Corcoran Group)",
    "Sales Gallery at 221 Royal Poinciana Way, Suite #1, Palm Beach",
    "Four full-floor penthouses plus one duplex penthouse on floors 25-28",
    "Rogers by Related Ross — turnkey custom home program for select buyers",
    "Originally developed by Hines + The Frisbie Group as Flagler Towers Project DEV LLC; now led by Related Ross",
    "10 minutes to Palm Beach International Airport",
    "Adjacent to the Norton Museum of Art and its 7,000-piece collection",
    "Very private project — developer pricing rarely made public; MLS + broker intel required for current values"
  ],

  // Neighborhood proximity
  nearby: [
    "Norton Museum of Art & Sculpture Garden — adjacent",
    "Worth Avenue — across the bridge",
    "Royal Poinciana Plaza — minutes away",
    "CityPlace — walkable",
    "Kravis Center for the Performing Arts — nearby",
    "Palm Beach Marina",
    "Palm Beach International Airport — 10 minutes",
    "Flagler Drive waterfront walking/cycling trail",
    "West Palm Beach GreenMarket (Saturdays)",
    "El Cid historic neighborhood"
  ],

  // Gallery images (high-res from southflaglerhouse.com)
  gallery: {
    exterior: [
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-02/EXT05_Crown.jpg", caption: "Crown Exterior" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/V03%20Hummingbird.jpg", caption: "Hummingbird View — Tower Elevation" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-10/e441fe45f460baccade29afbb9a0a276abf3f5b4%20%282%29.png", caption: "Park Tower and Lake Tower" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-02/EXT03_Motor%20Court%20Entrance.jpg", caption: "Motor Court Entrance" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/image_promenade.jpg", caption: "South Flagler Drive Promenade" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/bd90435ed546d0ea0106df70a59337d2bbaa05da.jpg", caption: "Port Cochere" }
    ],
    interiors: [
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT15_LT_Living_South_12th.jpg", caption: "Lake Tower Living Room, 12th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT01_Living%20Room%2017th%20Floor.jpg", caption: "Living Room, 17th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT12%20East%20Tower%20PH%20Living%20Room%20Looking%20South_E4%208K.jpg", caption: "East Tower Penthouse Living Room" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT30_PT%20Reception%2014th%20Floor.jpg", caption: "Park Tower Reception, 14th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT13%20LT%20Kitchen%2012th%20Floor_v9_0.jpg", caption: "Lake Tower Kitchen, 12th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT06%20Kitchen%2017th%20Floor_Kitchen%20Look%2008_Updated.jpg", caption: "Kitchen, 17th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT03_Master_Bedroom_v0.jpg", caption: "Master Bedroom" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT20%20PT%20Primary%20Bedroom%20Duplex%2027th%20Floor_0.jpg", caption: "Penthouse Primary Bedroom, Duplex 27th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT04%20Her%20Maser%20Bath%2018th%20Floor_v05_8k.jpg", caption: "Her Master Bath, 18th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/INT40_PT_Master%20Bathroom_B7.jpg", caption: "Park Tower Master Bathroom" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT21_PT%20Existing%20Living%20Room%20North%2018th%20Floor.jpg", caption: "Living Room North, 18th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/INT02_Loggia%2018th%20Floor.jpg", caption: "Loggia, 18th Floor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/EXT04_Penthouse%20Deck_E2_8k_0.jpg", caption: "Penthouse Deck" }
    ],
    amenities: [
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/STILL_Pool.jpg", caption: "Lakefront Pool" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/5df1c7d9e6779613fa6739953766b6c3fc37c56b.jpg", caption: "Poolside" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/f797d600f97ceed0d5e529b7423c32efe491785b.jpg", caption: "Pool Amenity" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/0bee63b24b0dc7b416e2f9c63e8f7e108433f9a5.jpg", caption: "Pool Deck Cabanas" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-08/Spa.jpg", caption: "Spa" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/174788b3733b64544fee47bb8898a929b092cd9f.jpg", caption: "Salon" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/d65e8ae972d5948df12081aa6b1ecdd0e29852ca%20%281%29.jpg", caption: "Sports Simulator Lounge" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/0decfd9a10b09be329ed3c77b6dea5122e15b588.jpg", caption: "Golf Simulator" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/83e6132209ea3af5de9f4350d00b69c464366fd7.jpg", caption: "Gym Facilities" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/42532c47288179b7379b6153af3a3c5da2c91987%20%281%29.jpg", caption: "Fitness Center" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/bb1ec3fd1c9a0f6fbdde6bc1e68f889e50aa8274.jpg", caption: "Courts" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/3e635da353e7a28a50bf0d130c158fe3dbab2954.jpg", caption: "Cocktail Lounge" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/7a5ac4a562ed09608e6555f728d0863066d7ae5e.jpg", caption: "Dining Room" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/adf8ee7344d39025159b51a58438848a1b99b151.jpg", caption: "Outdoor Dining Patio" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/77cb8d952054e20f1d7dbb35a4e21eeacb751016.jpg", caption: "Wine Tasting Room" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/71ac179bedf98d8065d8eeda26850122555fd90b.jpg", caption: "Private Interior Dining" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/417f6784847f36e11c8406142654ecaeaba641a2.jpg", caption: "Library & Card Room / Parlor" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/d2d522f132b8207b96a1a957fd756d199eabdfd1.jpg", caption: "Sports Lounge / Games Room" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/b167c32fbab12ade4ec90890d7e5bdb01e1686fd.jpg", caption: "Theater Room" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/fdd6bdc29fb4c2568ba55c2ed029ee445526fd37.jpg", caption: "Co-Working Space" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/8ca4b5518fa887d393a5f478399d3a69eb3808e8.jpg", caption: "Private Office" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/7ac1939f6d254560b4c7c7f772c5218fcc3e12c0.jpg", caption: "Lobby" },
      { url: "https://www.southflaglerhouse.com/sites/default/files/2025-11/109c6960a1183072fb5ade371679f5d2215cb541%20%283%29.png", caption: "Amenities Map" }
    ]
  },

  // Floor plan images (from Google Drive)
  floorPlanImages: [
    { name: "Tier 1 South 6-9", url: "https://drive.google.com/file/d/1RcuRUEaD0k8GPQeY_oXMfeg72s7TtVFL/view" },
    { name: "Tier 1 North 6-9", url: "https://drive.google.com/file/d/1eCyk7QVJTzviaATEvncNtiVQMu-TUNsW/view" },
    { name: "Tier 1 West 7-8", url: "https://drive.google.com/file/d/1biXTlW7DeSlmRTmaMqud0xKRNkGHmFIV/view" },
    { name: "Tier 1 SW Guest Suite 5-9", url: "https://drive.google.com/file/d/1GYjatiUTXGdLs7GgFPeigm3KeGV0fF2n/view" },
    { name: "Tier 2 North 12-18 (Park)", url: "https://drive.google.com/file/d/1liCTZEo7mdZyCDLFbHKYyhtzjwgisdd3/view" },
    { name: "Tier 2 North 12-18 (Lake)", url: "https://drive.google.com/file/d/1FFuNTnau3OZhVtLs-7_NJtiZ0q1OKceO/view" },
    { name: "Tier 2 South 12-18 (Park)", url: "https://drive.google.com/file/d/133tiW3NHUPuuvg8Ts9hbwvPvFU2PVKNM/view" },
    { name: "Tier 2 South 12-18 (Lake)", url: "https://drive.google.com/file/d/1dl6qDCa_0vU1DtsZ4nSrqY9sUC_Ts4CX/view" },
    { name: "Tier 2 West 12-18", url: "https://drive.google.com/file/d/1DQkSYJhJd-HZMFCXKVa-CKH-rqCpTy88/view" },
    { name: "Tier 3 North 21-24", url: "https://drive.google.com/file/d/1Bcf761TLJEcH6Hi9eqHBdADwxKySLIh6/view" },
    { name: "Tier 3 South 21-24", url: "https://drive.google.com/file/d/1Zcec2KNFAB5ooMpYuYLHn24Xef3ultGF/view" }
  ],

  // Hero image for card
  heroImage: "https://www.southflaglerhouse.com/sites/default/files/2025-08/V03%20Hummingbird.jpg",

  // Theme colors (waterfront elegance — navy/cream)
  theme: {
    accentColor: "#1a3a5c",
    darkColor: "#0a1f33",
    lightAccent: "#c9b88c"
  },

  // Notes
  notes: [
    "Floor plan details from March 2024 draft marketing plans — subject to minor changes",
    "Residence tier pricing pulled from live website April 2026",
    "Live inventory sourced from ModernLivingRE.com MLS (April 2026)",
    "Off-market / confidential pricing from in-person broker showing notes",
    "Exclusive Sales: Adam McPherson (Related Ross) + Suzanne Frisbie (Corcoran Group)"
  ]
};

export default southflaglerhouse;
