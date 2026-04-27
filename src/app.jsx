import { useState } from "react";

const PROJECTS = {
  maisondor: {
    id: "maisondor",
    name: "Maison d'Or",
    subtitle: "South Flagler",
    tagline: "House of Gold — Ultra-Luxury Boutique Residences",

    // ── Contact & Identity ───────────────────────────────────────
    address: "3705 South Flagler Drive, West Palm Beach, FL 33405",
    phone: "561.273.7900",
    phone2: null,
    email: "info@LiveMaisondOr.com",
    website: "LiveMaisondOr.com",
    salesGallery: "3014 South Dixie Hwy, West Palm Beach, FL 33405",
    instagram: "https://www.instagram.com/maison.dor.southflagler/",

    // ── Status & Timeline ────────────────────────────────────────
    status: "Pre-Construction / Sales Launched",
    salesLaunch: "January 2026",
    estimatedDelivery: "TBD",
    constructionStart: "TBD",
    constructionLoan: null,

    // ── Team ─────────────────────────────────────────────────────
    developer: "Kolter Urban + Perko Development Partners",
    architect: "10 Design",
    architectOfRecord: null,
    interiorDesigner: "Hirsch Bedner Associates (HBA)",
    landscape: "EDSA",
    salesBroker: "Maison d'Or Realty Sales, LLC (exclusive)",
    management: "TBD",

    // ── Building Specs ───────────────────────────────────────────
    totalUnits: 39,
    totalFloors: 19,
    towers: null,
    residencesPerFloor: "2–3",
    siteSF: "1.4 acres",
    amenitiesSF: null,
    leedCertified: null,

    // ── Pricing & Units ──────────────────────────────────────────
    priceRange: "$5.7M – $15M+",
    priceFrom: 5700000,
    priceTo: 15000000,
    unitSizeRange: "~3,000 – 10,000+ SF interior",
    bedrooms: "2–4 Bedrooms + Den",
    views: "Intracoastal Waterway, Atlantic Ocean, Palm Beach Island, City Skyline",
    parking: "Private elevator entry; valet available",
    depositStructure: null,

    // ── Location Context ─────────────────────────────────────────
    locationNote: "Across Intracoastal from Mar-a-Lago on South Flagler Drive",
    accentColor: "#C49A3C",
    darkColor: "#100c00",
    theme: "gold",
    renderings: [
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Facade.jpg", caption: "Facade", category: "Exterior" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Hero-East-Face.jpg", caption: "East Face", category: "Exterior" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Hero-West-Face.jpg", caption: "West Face", category: "Exterior" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Hover-Vista_25.11.06.jpg", caption: "Aerial Vista", category: "Exterior" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-West-Porte-Cochere.jpg", caption: "West Porte Cochère", category: "Exterior" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Lobby-Entry.jpg", caption: "Lobby Entrance", category: "Common Areas" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Resident-Clubroom.jpg", caption: "Resident Clubroom", category: "Common Areas" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-East-Pool-Deck.jpg", caption: "East Pool Deck", category: "Amenities" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Hero-Pool-Deck.jpg", caption: "Pool Deck Hero", category: "Amenities" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Pool-Cabana-Vignette.jpg", caption: "Pool Cabana", category: "Amenities" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-PH-Terrace.jpg", caption: "Penthouse Terrace", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-A-Great-Room.jpg", caption: "Res. A — Great Room", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-A-Great-Room-Terrace.jpg", caption: "Res. A — Great Room Terrace", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-A-Kitchen.jpg", caption: "Res. A — Kitchen", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-A-Den.jpg", caption: "Res. A — Den", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-B-Terrace.jpg", caption: "Res. B — Terrace", category: "Residences" },
      { url: "https://livemaisondor.com/wp-content/uploads/2025/12/Maison-dOr-Residence-C-Great-Room.jpg", caption: "Res. C — Great Room", category: "Residences" },
    ],
    floorPlanImages: [
      { name: "Residence A1", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/A1.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Residence-A1-Broker.pdf" },
      { name: "Residence A", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/A.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Residence-A-Broker.pdf" },
      { name: "Residence B", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/B.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Residence-B-Broker.pdf" },
      { name: "Residence C1", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/C1.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Residence-C1-Broker.pdf" },
      { name: "Residence C", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/C.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Residence-C-Broker.pdf" },
      { name: "Estate A", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/Estate-A.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Estate-A-Broker.pdf" },
      { name: "Estate B", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/Estate-B.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Estate-B-Broker.pdf" },
      { name: "Lower Penthouse A", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/LPH-A.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Penthouse-LPH-A-Broker.pdf" },
      { name: "Lower Penthouse B", thumb: "https://livemaisondor.com/wp-content/uploads/2026/03/LPH-B.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Penthouse-LPH-B-Broker.pdf" },
      { name: "Penthouse", thumb: "https://livemaisondor.com/wp-content/uploads/2025/12/PH.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2026/04/Penthouse-PH-Broker.pdf" },
    ],
    brokerDocs: [
      { name: "Fact Sheet", thumb: "https://livemaisondor.com/wp-content/uploads/2025/12/MaisondOr-Fact-Sheet.jpg", pdf: "https://livemaisondor.com/wp-content/uploads/2025/12/MaisondOr-Fact-Sheet.pdf" },
      { name: "POI Neighborhood Map", thumb: "https://livemaisondor.com/wp-content/uploads/2026/01/MaisondOr-POI-Map-R3-Digital.png", pdf: "https://livemaisondor.com/wp-content/uploads/2026/01/MaisondOr-POI-Map-R3-Digital.pdf" },
    ],
    amenities: [
      { category: "Aquatic & Outdoor", icon: "🏊", items: ["Elevated pool deck with panoramic Intracoastal views", "Resort-style pool with full-service cabanas", "New-construction dockage — direct water access (rare on South Flagler)", "Spa pool & outdoor relaxation areas"] },
      { category: "Social & Entertainment", icon: "🥂", items: ["Club Lounge with cocktail bar — 'The Green Room' (palm-print wallpaper)", "Private dining room with catering kitchen", "Screening theater — moody, plush lounge seating", "Virtual sports swing simulator suite", "Private wine storage & tasting room"] },
      { category: "Wellness & Spa", icon: "🧖", items: ["Full-service spa with steam rooms & sauna", "Fitness center", "Salon & grooming services", "Dedicated dog spa"] },
      { category: "Resident Services", icon: "🔑", items: ["Two furnished guest suites for owner use", "Bespoke concierge: private aviation, yacht charter, personal chefs, fitness training, event planning", "Comprehensive owner-absentee care program", "Private elevator entry per residence", "24/7 building services"] },
      { category: "Interior Finishes", icon: "✨", items: ["Floor-to-ceiling windows throughout", "East & west terraces in every residence", "Ceiling heights up to 11 ft in penthouse residences", "Custom cabinetry with quartz countertops", "Premium Sub-Zero & Wolf appliances", "Inspired by Mediterranean & Regency styles (HBA)", "Vibrant accents of gold, pink, green & blue in common areas"] },
    ],
    floorPlans: [
      { name: "Residence A1", beds: "3 Bed + Den", baths: "4.5 Bath", floors: "Level 4 only", sqft: 4141, priceFrom: 7799000, tier: "Residence" },
      { name: "Residence A", beds: "3 Bed + Den", baths: "4.5 Bath", floors: "Levels 5–14", sqft: 4353, priceFrom: 8499000, tier: "Residence" },
      { name: "Residence B", beds: "2 Bed + Den", baths: "3 Bath", floors: "Levels 4–14", sqft: 2991, priceFrom: 5799000, tier: "Residence" },
      { name: "Residence C1", beds: "3 Bed + Den", baths: "4.5 Bath", floors: "Level 4 only", sqft: 4230, priceFrom: 7699000, tier: "Residence" },
      { name: "Residence C", beds: "3 Bed + Den", baths: "4.5 Bath", floors: "Levels 5–14", sqft: 4430, priceFrom: 7999000, tier: "Residence" },
      { name: "Estate A", beds: "4 Bed + Den", baths: "5.5 Bath", floors: "Levels 15–17", sqft: 5922, priceFrom: 12999000, tier: "Estate" },
      { name: "Estate B", beds: "4 Bed + Den", baths: "5.5 Bath", floors: "Levels 15–17", sqft: 5739, priceFrom: 12999000, tier: "Estate" },
      { name: "Lower Penthouse A", beds: "4 Bed + Den", baths: "5.5 Bath", floors: "Level 18", sqft: 5922, priceFrom: 14999000, tier: "Penthouse" },
      { name: "Lower Penthouse B", beds: "4 Bed + Den", baths: "5.5 Bath", floors: "Level 18", sqft: 5739, priceFrom: 14999000, tier: "Penthouse" },
      { name: "Penthouse", beds: "4+ Bed", baths: "5+ Bath", floors: "Level 19 (Full Floor)", sqft: 10000, priceFrom: null, tier: "Penthouse", note: "Pricing by request only" },
    ],
    keyFacts: [
      "Only 39 residences — ultra-boutique exclusivity on South Flagler",
      "Situated directly across the Intracoastal from Mar-a-Lago",
      "Sunrise over Intracoastal & Atlantic (east) + sunset over city (west) from every home",
      "Flow-through floor plans — east & west terraces standard in every residence",
      "Private new-construction dockage — rare amenity on South Flagler Drive",
      "8 distinct floor plan configurations from ~3,000 to 10,000+ SF",
      "Penthouse spans entire 19th floor — over 10,000 SF",
      "Named 'Maison d'Or' (House of Gold) — inspired by ethereal Floridian golden light",
      "Price sheet updated December 2025 — Penthouse pricing by request",
    ],
  },

  olara: {
    id: "olara",
    name: "Olara",
    subtitle: "North Flagler",
    tagline: "Waterfront Wellness Residences on the Intracoastal",

    // ── Contact & Identity ───────────────────────────────────────
    address: "1919 N Flagler Dr, West Palm Beach, FL 33407",
    phone: "561.448.3015",
    phone2: "561.823.2830",
    email: "Sales@olarawestpalmbeach.com",
    website: "OlaraWestPalmBeach.com",
    salesGallery: "300 Butler Street, West Palm Beach, FL 33407",
    instagram: null,

    // ── Status & Timeline ────────────────────────────────────────
    status: "Under Construction",
    salesLaunch: "January 2023",
    estimatedDelivery: "Q1 2028",
    constructionStart: "March 2024",
    constructionLoan: "$380M — Zeckendorf, Sculptor, OneIM, Octo Capital",

    // ── Team ─────────────────────────────────────────────────────
    developer: "Savanna (New York)",
    architect: "Arquitectonica (Bernardo Fort-Brescia)",
    architectOfRecord: null,
    interiorDesigner: "Gabellini Sheppard Associates",
    landscape: "EDSA",
    salesBroker: "Compass (Alison Newton & Chris Deitz)",
    management: "Arch Amenities (all-year)",
    contractor: "Gilbane Building Company + SavCon",

    // ── Building Specs ───────────────────────────────────────────
    totalUnits: 287,
    totalFloors: 26,
    towers: 2,
    residencesPerFloor: null,
    siteSF: "4 acres",
    amenitiesSF: "80,000+ SF",
    leedCertified: null,

    // ── Pricing & Units ──────────────────────────────────────────
    priceRange: "$1.95M – $8M+",
    priceFrom: 1950000,
    priceTo: 8000000,
    unitSizeRange: "1,483 – 4,110 SF interior",
    bedrooms: "2–4 Bedrooms",
    views: "Intracoastal Waterway, Palm Beach Island, Atlantic Ocean, City Skyline",
    parking: "2 full-size side-by-side spots included (EV capable)",
    depositStructure: null,

    // ── Location Context ─────────────────────────────────────────
    locationNote: "North Flagler Drive waterfront — 4-acre site, private marina",
    accentColor: "#2D9FBF",
    darkColor: "#00080f",
    theme: "ocean",
    renderings: [],
    floorPlanImages: [
      { name: "Plan A", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_A.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_A.pdf" },
      { name: "Plan B", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_B.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_B.pdf" },
      { name: "Plan C", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_C.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_C.pdf" },
      { name: "Plan D", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_D.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf" },
      { name: "Plan E", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_E.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_E.pdf" },
      { name: "Plan F", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_F.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_F.pdf" },
      { name: "Plan G", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_G.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_G.pdf" },
      { name: "Plan H", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_H.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_H.pdf" },
      { name: "Plan I", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_I.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_I.pdf" },
      { name: "Plan J", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_J.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_J.pdf" },
      { name: "Plan K", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_K.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_K.pdf" },
      { name: "Plan L", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_L.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_L.pdf" },
      { name: "Plan M", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_M.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_M.pdf" },
      { name: "Plan N", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_N.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_N.pdf" },
      { name: "Plan O", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_O.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_O.pdf" },
      { name: "Plan P", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_P.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_P.pdf" },
      { name: "Plan Q", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_Q.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_Q.pdf" },
      { name: "Plan T", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_T.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_T.pdf" },
      { name: "Plan U", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_U.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_U.pdf" },
      { name: "Plan V", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_V.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_V_401_501.pdf" },
      { name: "Plan W", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_W.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_W_402_502.pdf" },
      { name: "Plan X", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_207%2C+307%2C+403%2C+503.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_X_207_307_403_503.pdf" },
      { name: "Plan Y-208", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_208.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_Y_208.pdf" },
      { name: "Plan Y-308/404/504", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_308, 404, 504.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_Y_308_404_504.pdf" },
      { name: "Plan Z-209", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_209.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_Z_209.pdf" },
      { name: "Plan Z-309/405/505", thumb: "https://d3af2gfyi5943v.cloudfront.net/app/layout-thumbnails/Floorplans_309, 405, 505.png", pdf: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_031126_Z_309_405_505.pdf" },
    ],
    brokerDocs: [
      { name: "Fact Sheet — March 2026", thumb: null, pdf: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Fact-Sheet-March-2026-2.pdf" },
      { name: "Brochure", thumb: null, pdf: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/RackBrochure_Digital_032026.pdf" },
      { name: "All Floor Plans (Combined PDF)", thumb: null, pdf: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Floor-Plans-All-March-2026.pdf" },
      { name: "Amenities Brochure", thumb: null, pdf: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara_Amenities_DigitalBrochure_032026.pdf" },
      { name: "Download All Files (ZIP)", thumb: null, pdf: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Downloads-1.zip" },
    ],
    amenities: [
      { category: "Wellness", icon: "🧘", items: ["13,000 SF fitness center by The Wright Fit", "Open-air yoga deck", "Performance training zones with indoor-outdoor turf lanes", "Pilates & energy studio", "Five-star regeneration spa (Arch Amenities — Baccarat NYC / Eau Spa)", "Japanese-style Onsen", "Cold plunge & vitality pools", "Steam, sauna & treatment rooms", "Meditation & relaxation rooms", "Sollis Health concierge medicine (1-year membership for buyers)"] },
      { category: "Aquatic & Marina", icon: "⚓", items: ["Olympic-size lap pool", "Leisure pool with full-service cabanas", "192-ft private marina extending into Intracoastal", "Dedicated boat slips (for-purchase)", "Two house yachts", "Seafaring concierge & yacht charter services", "Waterfront Veranda"] },
      { category: "Dining", icon: "🍽️", items: ["8,500 SF José Andrés Group restaurant (Michelin-starred — first Palm Beaches location)", "Juice bar", "Private dining room & catering kitchen", "In-residence dining service", "Epicurean marketplace (30,000 SF of F&B space)"] },
      { category: "Social & Work", icon: "🎯", items: ["Game room", "Multi-sports simulator", "Coworking & multimedia lounges", "Private offices & conference spaces", "Resident app for all services"] },
      { category: "Building Services", icon: "🏢", items: ["24/7 concierge & private security", "Valet parking", "Full building generator — entire building including each residence (unique in market)", "Two full-size side-by-side parking spots included (EV ready)", "All-year management by Arch Amenities", "Only new development on North Flagler Promenade with private marina dock", "$380M construction financing secured — strong timeline confidence"] },
    ],
    floorPlans: [
      { name: "Model L", beds: "2 Bed", baths: "2.5 Bath", den: false, exposure: "South", interiorSF: 1483, terraceSF: 354, priceFrom: 1950000, tier: "2BR" },
      { name: "Model N", beds: "2 Bed", baths: "2.5 Bath", den: false, exposure: "Northwest", interiorSF: 1741, terraceSF: 381, priceFrom: 2258000, tier: "2BR" },
      { name: "Model A", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "North", interiorSF: 1857, terraceSF: 466, priceFrom: 2452000, tier: "2BR+Den" },
      { name: "Model B", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "North", interiorSF: 1983, terraceSF: 431, priceFrom: null, tier: "2BR+Den", note: "Contact for pricing" },
      { name: "Model D", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "East", interiorSF: 1774, terraceSF: 381, priceFrom: 4897000, tier: "2BR+Den" },
      { name: "Model H", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "South", interiorSF: 1914, terraceSF: 362, priceFrom: 2391000, tier: "2BR+Den" },
      { name: "Model J", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "West", interiorSF: 1887, terraceSF: 576, priceFrom: 2690000, tier: "2BR+Den" },
      { name: "Model K", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "West", interiorSF: 1908, terraceSF: 376, priceFrom: 2350000, tier: "2BR+Den" },
      { name: "Model W", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "TBD", interiorSF: 2498, terraceSF: 540, priceFrom: null, tier: "2BR+Den", note: "Lower floors 402/502 — contact for pricing" },
      { name: "Model M", beds: "3 Bed", baths: "3.5 Bath", den: false, exposure: "Southwest", interiorSF: 2489, terraceSF: 750, priceFrom: 3032000, tier: "3BR" },
      { name: "Model I", beds: "3 Bed", baths: "3.5 Bath", den: false, exposure: "Southwest", interiorSF: 2358, terraceSF: 922, priceFrom: 3059000, tier: "3BR" },
      { name: "Model T", beds: "3 Bed", baths: "3.5 Bath", den: false, exposure: "Northwest", interiorSF: 2999, terraceSF: 723, priceFrom: 4623000, tier: "3BR" },
      { name: "Model P", beds: "3 Bed", baths: "3.5 Bath", den: false, exposure: "Southwest", interiorSF: 2656, terraceSF: 1196, priceFrom: 4180000, tier: "3BR" },
      { name: "Model Q", beds: "3 Bed", baths: "3.5 Bath", den: false, exposure: "Southwest", interiorSF: 2378, terraceSF: 546, priceFrom: 2820000, tier: "3BR" },
      { name: "Model C", beds: "3 Bed + Den", baths: "3.5 Bath", den: true, exposure: "Northeast", interiorSF: 3286, terraceSF: 1225, priceFrom: 6262000, tier: "3BR+Den" },
      { name: "Model E", beds: "3 Bed + Den", baths: "3.5 Bath", den: true, exposure: "East", interiorSF: 2963, terraceSF: 605, priceFrom: 5075000, tier: "3BR+Den" },
      { name: "Model U", beds: "3 Bed + Den", baths: "3.5 Bath", den: true, exposure: "North", interiorSF: 2578, terraceSF: 584, priceFrom: 4375000, tier: "3BR+Den" },
      { name: "Model O", beds: "3 Bed + Den", baths: "3.5 Bath", den: true, exposure: "South", interiorSF: 3034, terraceSF: 565, priceFrom: 4674000, tier: "3BR+Den" },
      { name: "Model V", beds: "3 Bed + Den", baths: "3.5 Bath", den: true, exposure: "TBD", interiorSF: 3008, terraceSF: 1110, priceFrom: null, tier: "3BR+Den", note: "Lower floors 401/501 — contact for pricing" },
      { name: "Model F", beds: "4 Bed + Den", baths: "4.5 Bath", den: true, exposure: "Northeast", interiorSF: 3805, terraceSF: 793, priceFrom: 8000000, tier: "4BR+Den" },
      { name: "Model G", beds: "4 Bed + Den", baths: "4.5 Bath", den: true, exposure: "Southeast", interiorSF: 4110, terraceSF: 599, priceFrom: 8000000, tier: "4BR+Den" },
      { name: "Model X", beds: "4 Bed + Den", baths: "4.5 Bath", den: true, exposure: "TBD", interiorSF: 4038, terraceSF: 1340, priceFrom: null, tier: "4BR+Den", note: "Lower floors 207/307/403/503 — contact for pricing" },
      { name: "Model Y-208", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "TBD", interiorSF: 3402, terraceSF: 1809, priceFrom: null, tier: "2BR+Den", note: "Floor 208 — massive 1,809 SF terrace — contact for pricing" },
      { name: "Model Y-308/404/504", beds: "2 Bed + Den", baths: "2.5 Bath", den: true, exposure: "TBD", interiorSF: 3552, terraceSF: 440, priceFrom: null, tier: "2BR+Den", note: "Floors 308/404/504 — contact for pricing" },
      { name: "Model Z-209", beds: "4 Bed + Den", baths: "4.5 Bath", den: true, exposure: "TBD", interiorSF: 4015, terraceSF: 1674, priceFrom: null, tier: "4BR+Den", note: "Floor 209 — massive 1,674 SF terrace — contact for pricing" },
      { name: "Model Z-309/405/505", beds: "4 Bed + Den", baths: "4.5 Bath", den: true, exposure: "TBD", interiorSF: 4228, terraceSF: 602, priceFrom: null, tier: "4BR+Den", note: "Floors 309/405/505 — contact for pricing" },
    ],
    keyFacts: [
      "Only new development on North Flagler Promenade with private marina dock",
      "Full building generator — each individual residence included (unique to Olara)",
      "Two side-by-side parking spots included per unit, no extra charge (EV ready)",
      "$380M construction financing fully secured — strong timeline confidence",
      "~50% presold as of late 2025",
      "José Andrés Group restaurant — Michelin-starred, first Palm Beaches location",
      "Sollis Health concierge medicine membership included for buyers",
      "287 condos across two 26-story towers on 4-acre site",
      "Groundbreaking March 2024 — vertical construction underway (podium complete)",
      "Price sheet current as of April 2026 — subject to change",
    ],
  },

  shorecrest: {
    id: "shorecrest",
    name: "Shorecrest",
    subtitle: "North Flagler",
    tagline: "A New Standard of Waterfront Excellence",

    // ── Contact & Identity ───────────────────────────────────────
    address: "1865 N Flagler Drive, West Palm Beach, FL 33407",
    phone: "561.220.6011",
    phone2: "561.515.0711",
    email: "info@shorecrestwpb.com",
    website: "ShorecrestWPB.com",
    salesGallery: "460 S. Rosemary Ave, Suite 180, West Palm Beach, FL 33401",
    instagram: null,

    // ── Status & Timeline ────────────────────────────────────────
    status: "Under Construction",
    salesLaunch: "April 2024",
    estimatedDelivery: "Q4 2027",
    constructionStart: "April 2026",
    constructionLoan: "$157M — GoldenTree Asset Management",

    // ── Team ─────────────────────────────────────────────────────
    developer: "Related Ross (Stephen M. Ross)",
    architect: "Roger Ferris + Partners",
    architectOfRecord: "Revuelta Architecture International",
    interiorDesigner: "Rottet Studio (Lauren Rottet)",
    landscape: "DS Boca (Design Studio Boca)",
    salesBroker: "Corcoran Sunshine Marketing Group (exclusive)",
    management: "Related Management",
    contractor: null,

    // ── Building Specs ───────────────────────────────────────────
    totalUnits: 98,
    totalFloors: 28,
    towers: null,
    residencesPerFloor: 4,
    siteSF: null,
    amenitiesSF: "18,355 SF",
    leedCertified: "LEED Gold",

    // ── Pricing & Units ──────────────────────────────────────────
    priceRange: "$3.5M – $9.9M+",
    priceFrom: 3500000,
    priceTo: 9900000,
    unitSizeRange: "2,015 – 5,078 SF interior",
    bedrooms: "2–3 Bedrooms (+ combinable 4BR)",
    views: "Lake Worth Lagoon, Intracoastal Waterway, Atlantic Ocean, Palm Beach Island",
    parking: "5-story podium — 204 spaces, EV charging, valet",
    depositStructure: [
      "10% at Reservation",
      "10% at Hard Contract",
      "10% at Groundbreaking",
      "10% at Pouring of Purchaser's Residential Floor",
      "60% at Closing",
    ],

    // ── Location Context ─────────────────────────────────────────
    locationNote: "North Flagler Drive — near NORA district, 4 residences per floor",
    accentColor: "#5B8FA8",
    darkColor: "#020d12",
    theme: "slate",
    renderings: [],
    floorPlanImages: [],
    brokerDocs: [],
    amenities: [
      {
        category: "Ground Level",
        icon: "🏛️",
        items: [
          "Motor Court — lushly landscaped, discreet & gracious entrance",
          "Lobby Lounge",
          "Co-Working Lounge",
          "Coffee Bar",
          "Dog Spa / Dog Washing Room",
          "Bicycle Storage",
          "24-Hour Concierge",
          "Refrigerated storage for grocery & flower deliveries",
          "Separate service entrance",
          "Mail room & package room",
          "Valet & Parking Garage Entrance (EV charging)",
        ],
      },
      {
        category: "2nd Floor Club Level",
        icon: "🥂",
        items: [
          "Private Dining Room",
          "Catering Kitchen",
          "Cocktail Lounge with Outdoor Terrace",
          "Spa Suite — massage treatment rooms, steam rooms & infrared saunas",
          "Pilates Studio",
          "Equinox-designed Fitness Center",
          "Yoga Studio",
          "Golf Simulator & Lounge",
          "Game Lounge",
        ],
      },
      {
        category: "Roof Level",
        icon: "🌊",
        items: [
          "75-foot Lap Pool",
          "Hot & Cold Plunge",
          "Private Cabanas",
          "Private Dining (rooftop)",
          "Roof Deck with lounge chairs & grill",
          "Outdoor Lounge",
        ],
      },
      {
        category: "Interior Finishes",
        icon: "✨",
        items: [
          "Hurricane-rated floor-to-ceiling glass — custom pale silver mullion",
          "~10 ft ceiling heights in main rooms; ~11 ft at Penthouse floor",
          "White Oak wood plank flooring throughout main rooms",
          "8 ft tall solid core wood interior doors",
          "Painted 6\" base molding",
          "Digital + hard lock entry mechanisms",
          "Kitchen: Gaggenau appliances (refrigerator/freezer, oven, cooktop, microwave, dishwasher)",
          "Kitchen: Custom White Oak European millwork",
          "Kitchen: Honed Cote D'Vaniglia marble backsplash & perimeter countertop",
          "Kitchen: Calacatta Fioritto marble or Cielo quartzite island countertop",
          "Kitchen: Full-height wine refrigerator & Dornbracht fixtures",
          "Primary Bath: Limestone flooring, Namibia White marble walls",
          "Primary Bath: Custom vanity with double sinks, Alexander Nuvolato marble top",
          "Primary Bath: Freestanding soaking tub, rain shower, handheld, Kohler Innate washlet",
          "Primary Bath: Recessed medicine cabinets, Dornbracht fixtures",
          "Secondary Baths: Grigio Trambiserra marble feature walls, Dornbracht fixtures",
          "Terraces: Porcelain tile flooring, glass railing",
        ],
      },
      {
        category: "Technology & Systems",
        icon: "⚡",
        items: [
          "Lutron home automation — lighting & thermostat controls",
          "Enhanced cell service & super-fast network speeds",
          "Wi-Fi hotspots throughout building",
          "Vertical heat pumps for year-round HVAC control",
          "Fully vented electric washers & dryers",
          "Wellness: ducted fresh air with multiple filtration points",
          "Wellness: filtered water; multi-zone climate control; low VOC materials & green cleaning",
        ],
      },
      {
        category: "Related Life & Services",
        icon: "🌟",
        items: [
          "Resident Manager, handyman & porter",
          "On-site Lifestyle Concierge — restaurant reservations, event programming, travel",
          "Related Life Events: fitness classes, workshops, tastings with chefs & sommeliers, children's events",
          "Related Artisan Home: dedicated point of contact, home care while away, warranty management, home orientation & warmer",
          "Preferred vendor list & customization support",
        ],
      },
    ],
    floorPlans: [
      // UNIT 1 — 3BR/3.5BA, Private Elevator — East-facing
      {
        name: "Unit 1", beds: "3 Bed", baths: "3.5 Bath", den: false,
        exposure: "East", floors: "Floors 3–28",
        interiorSF: 2835, terraceSF: 345,
        priceFrom: 3810000, tier: "3BR",
        features: "Great Room 25×25, Kitchen 30×11, Private Elevator",
        note: "Listed as Unit 301 on avail. sheet at $3.81M — confirm current pricing",
      },
      // UNIT 2 — 2BR/2.5BA, Private Elevator — East-facing
      {
        name: "Unit 2", beds: "2 Bed", baths: "2.5 Bath", den: false,
        exposure: "East", floors: "Floors 2–7 & 9–28",
        interiorSF: 2016, terraceSF: 192,
        priceFrom: 2680000, tier: "2BR",
        features: "Living Room 20×24, Kitchen 17×10, Private Elevator",
        note: "Listed as Unit 302 on avail. sheet at $2.68M — confirm current pricing",
      },
      // UNIT 3 — 3BR/3.5BA, Private Elevator — East-facing
      {
        name: "Unit 3", beds: "3 Bed", baths: "3.5 Bath", den: false,
        exposure: "East", floors: "Floors 3–28",
        interiorSF: 2706, terraceSF: 256,
        priceFrom: 3450000, tier: "3BR",
        features: "Living Room 22×28, Kitchen 18×14, Private Elevator",
        note: "Listed as Unit 303 on avail. sheet at $3.45M — confirm current pricing",
      },
      // UNIT 4 — 3BR/3.5BA, Private Elevator — West-facing terraces
      {
        name: "Unit 4 (Floors 3–5)", beds: "2 Bed", baths: "2.5 Bath", den: false,
        exposure: "West (dual terraces)", floors: "Floors 3–5",
        interiorSF: 2141, terraceSF: 497,
        priceFrom: null, tier: "2BR",
        features: "Great Room 18×27, large dual terraces (~24×10 & ~23×10), Private Elevator",
        note: "Large terrace on lower floors — contact for pricing",
      },
      {
        name: "Unit 4 (Floor 6)", beds: "3 Bed", baths: "3.5 Bath", den: false,
        exposure: "West (wrap terrace)", floors: "Floor 6 only",
        interiorSF: 2470, terraceSF: 1391,
        priceFrom: null, tier: "3BR",
        features: "Massive 59×15 wrap terrace — premium amenity floor location",
        note: "Exceptional 1,391 SF terrace — contact for pricing",
      },
      {
        name: "Unit 4 (Floors 7–28)", beds: "3 Bed", baths: "3.5 Bath", den: false,
        exposure: "West (dual terraces)", floors: "Floors 7–28",
        interiorSF: 2470, terraceSF: 497,
        priceFrom: 2730000, tier: "3BR",
        features: "Living Room 19×27, Dining 12×17, dual terraces (~24×10 & ~22×10)",
        note: "Listed as Unit 804 on avail. sheet at $2.73M — confirm current pricing",
      },
      // COMBO — Units 1+2 combined
      {
        name: "Combined Units 1+2", beds: "4 Bed", baths: "4.5 Bath", den: false,
        exposure: "North, East", floors: "Floor 9 (combinable on select floors)",
        interiorSF: 5078, terraceSF: 525,
        priceFrom: 9580000, tier: "4BR",
        features: "Great Room 46×24, Kitchen 23×13, Library 15×10, Sitting Room 29×18, Game Lounge",
        note: "Listed as Unit 2001/02 at $9.58M — confirm current pricing & availability",
      },
    ],
    keyFacts: [
      "Developed by Related Ross — Stephen M. Ross, who has committed ~$10B to WPB development",
      "98 residences across 28 floors — just 4 residences per floor for maximum privacy",
      "Groundbreaking announced April 2026 — completion anticipated 2027",
      "$157M construction loan secured from GoldenTree Asset Management",
      "Pricing from $3.5M — strong sales reported ahead of groundbreaking",
      "Curvilinear 'blade-like' mosaic façade designed by Roger Ferris + Partners",
      "Rottet Studio's first ground-up new development project in West Palm Beach",
      "Equinox partnership for fitness & wellness amenities — curated programming",
      "Rooftop 75-ft lap pool + hot & cold plunge with panoramic Intracoastal views",
      "18,355 SF of amenities including golf simulator, private dining, game lounge",
      "Sales led by Adam McPherson, SVP Residential Sales, Related Ross + Corcoran Sunshine",
      "Full Gaggenau appliance suite + Dornbracht fixtures + Lutron automation throughout",
      "LEED Gold compliant; Low VOC materials; wellness fresh-air filtration systems",
      "Deposit structure: 10/10/10/10/60 (Reservation → Hard Contract → Groundbreaking → Floor Pour → Closing)",
      "Two sales numbers: 561.220.6011 (main) and 561.515.0711",
    ],
    locationHighlights: {
      travelTimes: [
        { destination: "Flagler Memorial Bridge", minutes: 4 },
        { destination: "Royal Park Bridge", minutes: 6 },
        { destination: "The Breakers", minutes: 7 },
        { destination: "PBI Airport", minutes: 15 },
        { destination: "Miami (Brightline)", minutes: 80 },
      ],
      nearbyPOI: [
        "Brightline Station", "CityPlace", "NORA District (coming soon)", "Palm Beach Lake Trail",
        "Royal Poinciana Plaza", "Worth Avenue", "Norton Museum of Art", "Kravis Center",
        "Henry Morrison Flagler Museum", "The Society of the Four Arts", "Currie Park",
      ],
    },
  },
};

function fmt(n) {
  if (!n) return "Contact for pricing";
  return "$" + (n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2) + "M" : n.toLocaleString());
}

// ─── LOCKED THEME — DO NOT MODIFY ────────────────────────────────────────────
const T = {
  bg:          "#ffffff",  // page background
  bgAlt:       "#f7f7f7",  // alternating row / card bg
  bgCard:      "#f9f9f9",  // card background
  bgNav:       "#ffffff",  // nav background
  bgSection:   "#f4f4f4",  // section / header band
  border:      "#e5e5e5",  // standard border
  borderStrong:"#d0d0d0",  // stronger border
  text:        "#111111",  // primary text
  textSub:     "#555555",  // secondary text
  textMuted:   "#999999",  // muted / labels
  textInverse: "#ffffff",  // text on colored bg
  navText:     "#333333",  // nav inactive
  footerBg:    "#f4f4f4",  // footer
  footerText:  "#aaaaaa",  // footer text
};
// ─────────────────────────────────────────────────────────────────────────────

function ProjectBadge({ status }) {
  const isBuilding = status === "Under Construction";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: isBuilding ? "#e8f5e9" : "#fff8e1",
      color: isBuilding ? "#2e7d32" : "#e65100",
      border: `1px solid ${isBuilding ? "#a5d6a7" : "#ffcc80"}`,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      padding: "4px 10px", borderRadius: 20, textTransform: "uppercase"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
      {status}
    </span>
  );
}

function GalleryModal({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "fixed", top: 18, right: 24, background: "none", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", opacity: 0.7, zIndex: 10000 }}>✕</button>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: "90vw" }}>
        <img src={images[idx].url} alt={images[idx].caption}
          style={{ maxWidth: "90vw", maxHeight: "72vh", objectFit: "contain", borderRadius: 4, boxShadow: "0 4px 40px rgba(0,0,0,0.5)" }}
          onError={e => { e.target.alt = "Image unavailable — open PDF to view"; }} />
        <div style={{ color: "#eee", fontSize: 14 }}>{images[idx].caption}
          <span style={{ color: "#aaa", marginLeft: 8 }}>— {images[idx].category}</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === 0 ? "#555" : "#fff", padding: "8px 22px", borderRadius: 4, cursor: idx === 0 ? "default" : "pointer", fontSize: 18 }}>←</button>
          <span style={{ color: "#aaa", fontSize: 12 }}>{idx + 1} / {images.length}</span>
          <button onClick={() => setIdx(i => Math.min(i + 1, images.length - 1))} disabled={idx === images.length - 1}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === images.length - 1 ? "#555" : "#fff", padding: "8px 22px", borderRadius: 4, cursor: idx === images.length - 1 ? "default" : "pointer", fontSize: 18 }}>→</button>
        </div>
      </div>
    </div>
  );
}

function RenderingGallery({ renderings, accent }) {
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const cats = ["All", ...Array.from(new Set(renderings.map(r => r.category)))];
  const filtered = filter === "All" ? renderings : renderings.filter(r => r.category === filter);

  if (!renderings.length) return (
    <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "40px 0" }}>No renderings loaded yet for this project.</div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === c ? accent : T.border}`, background: filter === c ? accent : T.bg, color: filter === c ? T.textInverse : T.textSub, fontSize: 12, cursor: "pointer" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
        {filtered.map((img, i) => {
          const globalIdx = renderings.indexOf(img);
          return (
            <div key={i} onClick={() => setModal(globalIdx)} style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", aspectRatio: "4/3", background: T.bgAlt }}>
              <img src={img.url} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                onError={e => { e.target.style.display = "none"; }}
                onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                onMouseOut={e => e.target.style.transform = "scale(1)"} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.7))", padding: "24px 10px 8px", fontSize: 11, color: "#fff" }}>{img.caption}</div>
            </div>
          );
        })}
      </div>
      {modal !== null && <GalleryModal images={renderings} startIndex={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function FloorPlanCard({ plan, accent, pdfInfo }) {
  const [expanded, setExpanded] = useState(false);
  const tierBorder = {
    "Residence": "#1a6bb5", "Estate": "#b56a1a", "Penthouse": "#8a6a1a",
    "2BR": "#1a6bb5", "2BR+Den": "#1a6bb5", "3BR": "#1a7a3a", "3BR+Den": "#1a7a3a", "4BR+Den": "#b56a1a"
  };
  return (
    <div style={{ background: T.bg, border: `1px solid ${expanded ? accent : T.border}`, borderRadius: 10, padding: 18, display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{plan.name}</div>
          <div style={{ fontSize: 11, color: accent, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{plan.tier}</div>
        </div>
        {plan.priceFrom
          ? <div style={{ color: accent, fontWeight: 700, fontSize: 14 }}>From {fmt(plan.priceFrom)}</div>
          : <div style={{ color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{plan.note ? "Contact" : "Contact for pricing"}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, fontSize: 12 }}>
        <div style={{ color: T.textSub }}>🛏 {plan.beds}</div>
        <div style={{ color: T.textSub }}>🚿 {plan.baths}</div>
        {plan.sqft && <div style={{ color: T.textSub }}>📐 {plan.sqft.toLocaleString()} SF</div>}
        {plan.interiorSF && <div style={{ color: T.textSub }}>📐 Int: {plan.interiorSF.toLocaleString()} SF</div>}
        {plan.terraceSF && <div style={{ color: T.textSub }}>🌿 Terrace: {plan.terraceSF.toLocaleString()} SF</div>}
        {plan.exposure && <div style={{ color: T.textSub }}>🧭 {plan.exposure}</div>}
        {plan.floors && <div style={{ color: T.textSub, gridColumn: "span 2" }}>🏢 {plan.floors}</div>}
      </div>
      {plan.note && <div style={{ fontSize: 11, color: "#c06000", fontStyle: "italic" }}>{plan.note}</div>}
      {plan.features && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>📋 {plan.features}</div>}

      {pdfInfo && pdfInfo.thumb && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: expanded ? accent : T.bgAlt, border: `1px solid ${expanded ? accent : T.border}`, color: expanded ? T.textInverse : T.textSub, fontSize: 12, padding: "6px 12px", borderRadius: 6, cursor: "pointer", width: "100%", justifyContent: "center", fontWeight: 600, transition: "all 0.2s" }}
          >
            {expanded ? "▲ Hide Floor Plan" : "▼ View Floor Plan"}
          </button>
          {expanded && (
            <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${accent}55` }}>
              <img src={pdfInfo.thumb} alt={`Floor Plan ${plan.name}`} style={{ width: "100%", height: "auto", display: "block" }}
                onError={e => { e.target.style.display = "none"; }} />
              <div style={{ padding: "10px 12px", background: T.bgAlt, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.textSub }}>{plan.name} — {(plan.interiorSF || plan.sqft || 0).toLocaleString()} SF interior</span>
                <a href={pdfInfo.pdf} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: accent, textDecoration: "none", fontWeight: 600 }}>Download PDF ↗</a>
              </div>
            </div>
          )}
        </div>
      )}
      {pdfInfo && !pdfInfo.thumb && (
        <a href={pdfInfo.pdf} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: accent, fontSize: 11, textDecoration: "none", fontWeight: 600, marginTop: 2 }}>📄 Download Floor Plan PDF</a>
      )}
    </div>
  );
}

function ProjectView({ project }) {
  const [tab, setTab] = useState("overview");
  const [fpFilter, setFpFilter] = useState("All");
  const acc = project.accentColor;
  const tabs = ["overview", "floorplans", "amenities", "gallery", "broker", ...(project.locationHighlights ? ["location"] : [])];
  const tabLabels = { overview: "Overview", floorplans: `Floor Plans (${project.floorPlans.length})`, amenities: "Amenities", gallery: `Gallery (${project.renderings.length})`, broker: "Broker Toolkit", location: "Location" };
  const tiers = ["All", ...Array.from(new Set(project.floorPlans.map(p => p.tier)))];
  const filteredPlans = fpFilter === "All" ? project.floorPlans : project.floorPlans.filter(p => p.tier === fpFilter);

  return (
    <div>
      {/* Project Header */}
      <div style={{ background: T.bgSection, borderBottom: `3px solid ${acc}`, padding: "28px 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, color: acc, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{project.subtitle}</div>
            <h1 style={{ margin: "0 0 6px", fontSize: 34, fontWeight: 300, color: T.text, fontFamily: "Georgia, serif", letterSpacing: "-0.01em" }}>{project.name}</h1>
            <div style={{ color: T.textSub, fontSize: 13 }}>{project.tagline}</div>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <ProjectBadge status={project.status} />
            <div style={{ color: acc, fontWeight: 700, fontSize: 22 }}>{project.priceRange}</div>
            <div style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Starting Price Range</div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          {[
            ["Units", project.totalUnits],
            ["Floors", project.totalFloors + (project.towers ? ` (${project.towers} towers)` : "")],
            ["Developer", project.developer],
            ["Architect", project.architect],
            ["Est. Delivery", project.estimatedDelivery || "TBD"],
          ].map(([label, val], i) => (
            <div key={i} style={{ padding: "10px 18px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", marginTop: 4, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "12px 18px", background: "transparent", border: "none", borderBottom: tab === t ? `2px solid ${acc}` : "2px solid transparent", color: tab === t ? acc : T.textSub, fontSize: 12, fontWeight: tab === t ? 700 : 400, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "28px 32px" }}>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Key Highlights</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.keyFacts.map((fact, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "9px 14px", background: T.bgCard, borderRadius: 7, border: `1px solid ${T.border}` }}>
                    <span style={{ color: acc, flexShrink: 0, fontWeight: 700 }}>✦</span>
                    <span style={{ fontSize: 13, color: T.text }}>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Property Details</div>
                {[
                  ["Address", project.address],
                  ["Location", project.locationNote],
                  ["Views", project.views],
                  ["Unit Sizes", project.unitSizeRange],
                  ["Bedrooms", project.bedrooms],
                  ["Parking", project.parking],
                  project.residencesPerFloor && ["Per Floor", `${project.residencesPerFloor} residences`],
                  project.siteSF && ["Site Area", project.siteSF],
                  project.amenitiesSF && ["Amenity Space", project.amenitiesSF],
                  project.leedCertified && ["Certification", project.leedCertified],
                  ["Estimated Delivery", project.estimatedDelivery],
                  project.constructionStart && ["Construction Start", project.constructionStart],
                  project.constructionLoan && ["Construction Loan", project.constructionLoan],
                  ["Interior Design", project.interiorDesigner],
                  project.architectOfRecord && ["Arch. of Record", project.architectOfRecord],
                  project.contractor && ["Contractor", project.contractor],
                  project.management && ["Management", project.management],
                  project.salesBroker && ["Sales Broker", project.salesBroker],
                  project.depositStructure && ["Deposit Structure", project.depositStructure.join(" · ")],
                ].filter(Boolean).map(([label, val], i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: 13, color: T.text }}>{val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Contact</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13, color: T.textSub }}>
                  {project.phone && <div>📞 {project.phone}</div>}
                  {project.phone2 && <div>📞 {project.phone2}</div>}
                  {project.email && <div>✉️ {project.email}</div>}
                  {project.website && <div>🌐 {project.website}</div>}
                  {project.salesGallery && <div>📍 Sales Gallery: {project.salesGallery}</div>}
                  {project.instagram && <a href={project.instagram} target="_blank" rel="noreferrer" style={{ color: acc, textDecoration: "none" }}>📸 Instagram ↗</a>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "floorplans" && (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {tiers.map(tier => (
                <button key={tier} onClick={() => setFpFilter(tier)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${fpFilter === tier ? acc : T.border}`, background: fpFilter === tier ? acc : T.bg, color: fpFilter === tier ? T.textInverse : T.textSub, fontSize: 12, cursor: "pointer" }}>{tier}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 12 }}>
              {filteredPlans.map((plan, i) => {
                const letter = plan.name.replace("Model ", "");
                const pdfInfo = project.floorPlanImages.find(fp =>
                  fp.name === plan.name || fp.name === `Plan ${letter}` ||
                  fp.name.startsWith(`Plan ${letter}-`) || fp.name.startsWith(`Plan ${letter}/`)
                );
                return <FloorPlanCard key={i} plan={plan} accent={acc} pdfInfo={pdfInfo} />;
              })}
            </div>
          </div>
        )}

        {tab === "amenities" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {project.amenities.map((cat, i) => (
              <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.category}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {cat.items.map((item, j) => (
                    <li key={j} style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSub }}>
                      <span style={{ color: T.border, flexShrink: 0, marginTop: 1 }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "gallery" && <RenderingGallery renderings={project.renderings} accent={acc} />}

        {tab === "broker" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {project.brokerDocs.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Brochures & Documents</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {project.brokerDocs.map((doc, i) => (
                    <a key={i} href={doc.pdf} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 140, height: 180, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                        {doc.thumb ? <img src={doc.thumb} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : <span>📄</span>}
                      </div>
                      <span style={{ fontSize: 12, color: T.text, textAlign: "center", maxWidth: 140 }}>{doc.name}</span>
                      <span style={{ fontSize: 11, color: acc }}>Download ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {project.floorPlanImages.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Floor Plan Downloads ({project.floorPlanImages.length} plans)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
                  {project.floorPlanImages.map((fp, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                      <div style={{ width: "100%", aspectRatio: "3/4", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                        <img src={fp.thumb} alt={fp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                      </div>
                      <span style={{ fontSize: 11, color: T.text, textAlign: "center" }}>{fp.name}</span>
                      <a href={fp.pdf} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: acc, textDecoration: "none" }}>PDF ↗</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {project.brokerDocs.length === 0 && project.floorPlanImages.length === 0 && (
              <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14 }}>No broker documents loaded for this project yet.</div>
            )}
          </div>
        )}

        {tab === "location" && project.locationHighlights && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Travel Times</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.locationHighlights.travelTimes.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: T.bgCard, borderRadius: 7, border: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 13, color: T.text }}>🚗 {t.destination}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: acc }}>{t.minutes} min</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Points of Interest</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {project.locationHighlights.nearbyPOI.map((poi, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "8px 14px", background: T.bgCard, borderRadius: 7, border: `1px solid ${T.border}` }}>
                    <span style={{ color: acc, flexShrink: 0 }}>📍</span>
                    <span style={{ fontSize: 13, color: T.text }}>{poi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareView() {
  const projects = Object.values(PROJECTS);
  const rows = [
    ["Status", p => p.status],
    ["Address", p => p.address],
    ["Location", p => p.locationNote || "—"],
    ["Developer", p => p.developer],
    ["Architect", p => p.architect],
    ["Arch. of Record", p => p.architectOfRecord || "—"],
    ["Interior Design", p => p.interiorDesigner],
    ["Landscape", p => p.landscape || "—"],
    ["Management", p => p.management || "—"],
    ["Sales Broker", p => p.salesBroker || "—"],
    ["Total Units", p => p.totalUnits],
    ["Floors", p => p.totalFloors + (p.towers ? ` (${p.towers} towers)` : "")],
    ["Per Floor", p => p.residencesPerFloor ? `${p.residencesPerFloor} residences` : "—"],
    ["Site Area", p => p.siteSF || "—"],
    ["Amenity Space", p => p.amenitiesSF || "—"],
    ["LEED", p => p.leedCertified || "—"],
    ["Price Range", p => p.priceRange],
    ["Price From", p => fmt(p.priceFrom)],
    ["Unit Sizes", p => p.unitSizeRange],
    ["Bedrooms", p => p.bedrooms],
    ["Views", p => p.views],
    ["Parking", p => p.parking],
    ["Sales Launch", p => p.salesLaunch],
    ["Construction Start", p => p.constructionStart || "—"],
    ["Est. Delivery", p => p.estimatedDelivery || "TBD"],
    ["Construction Loan", p => p.constructionLoan || "—"],
    ["Deposit Structure", p => p.depositStructure ? p.depositStructure.join(" · ") : "—"],
  ];

  return (
    <div style={{ padding: "32px" }}>
      <h2 style={{ color: T.text, margin: "0 0 8px", fontSize: 24, fontWeight: 300, fontFamily: "Georgia, serif" }}>Side-by-Side Comparison</h2>
      <p style={{ color: T.textSub, fontSize: 13, margin: "0 0 28px" }}>All {projects.length} projects currently loaded</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 160, padding: "12px 16px", textAlign: "left", color: T.textMuted, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${T.borderStrong}` }}>Field</th>
              {projects.map(p => (
                <th key={p.id} style={{ padding: "12px 16px", textAlign: "left", borderBottom: `3px solid ${p.accentColor}`, minWidth: 220 }}>
                  <div style={{ color: p.accentColor, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.name}</div>
                  <div style={{ color: T.textSub, fontSize: 11, marginTop: 2 }}>{p.subtitle}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? T.bgAlt : T.bg }}>
                <td style={{ padding: "9px 16px", color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{label}</td>
                {projects.map(p => (
                  <td key={p.id} style={{ padding: "9px 16px", color: T.text, fontSize: 13, borderBottom: `1px solid ${T.border}` }}>{fn(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Price Range Visual</div>
        {projects.map(p => {
          const max = 16000000;
          return (
            <div key={p.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: p.accentColor, fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                <span style={{ color: T.textSub, fontSize: 13 }}>{p.priceRange}</span>
              </div>
              <div style={{ position: "relative", height: 16, background: T.bgAlt, borderRadius: 3, border: `1px solid ${T.border}` }}>
                <div style={{ position: "absolute", left: `${(p.priceFrom / max) * 100}%`, width: `${((p.priceTo - p.priceFrom) / max) * 100}%`, height: "100%", background: p.accentColor, borderRadius: 3, opacity: 0.8 }} />
                <div style={{ position: "absolute", right: 8, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: T.textMuted }}>$16M</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("maisondor");
  const projectList = Object.values(PROJECTS);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", colorScheme: "light" }}>
      {/* Nav */}
      <div style={{ background: T.bgNav, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "stretch", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, overflowX: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", paddingRight: 24, marginRight: 8, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Modern Living Group</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.04em" }}>New Construction Tool</div>
          </div>
        </div>
        {projectList.map(p => (
          <button key={p.id} onClick={() => setView(p.id)} style={{ padding: "16px 18px", background: "transparent", border: "none", borderBottom: view === p.id ? `2px solid ${p.accentColor}` : "2px solid transparent", color: view === p.id ? p.accentColor : T.navText, fontSize: 13, fontWeight: view === p.id ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
            {p.name}
          </button>
        ))}
        <button onClick={() => setView("compare")} style={{ padding: "16px 18px", background: "transparent", border: "none", borderBottom: view === "compare" ? "2px solid #999" : "2px solid transparent", color: view === "compare" ? T.text : T.textMuted, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
          ⇄ Compare
        </button>
        <button style={{ padding: "16px 18px", background: "transparent", border: "none", color: T.border, fontSize: 13, cursor: "default", whiteSpace: "nowrap" }}>
          + Add Project
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {view === "compare" ? <CompareView /> : PROJECTS[view] ? <ProjectView project={PROJECTS[view]} /> : null}
      </div>

      {/* Footer */}
      <div style={{ background: T.footerBg, borderTop: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: T.footerText }}>Modern Living Group New Construction Tool — Internal Use Only</div>
        <div style={{ fontSize: 11, color: T.footerText }}>Prices subject to change without notice · April 2026</div>
      </div>
    </div>
  );
}
