import { useState } from "react";

const T = {
  bg: "#ffffff", bgAlt: "#f7f7f7", bgCard: "#f9f9f9",
  border: "#e5e5e5", borderStrong: "#d0d0d0",
  text: "#111111", textSub: "#555555", textMuted: "#999999",
  accent: "#111111", accentLight: "#f0f0f0",
};

const STEPS = ["Method", "Scrape / Import", "Basic Info", "Team", "Building", "Pricing", "Gallery", "Floor Plans", "Review"];

const EMPTY_PROJECT = {
  id: "", name: "", subtitle: "", tagline: "",
  address: "", phone: "", phone2: "", email: "", website: "", salesGallery: "", instagram: "",
  status: "Pre-Construction / Sales Launched",
  salesLaunch: "", estimatedDelivery: "", constructionStart: "", constructionLoan: "",
  developer: "", architect: "", architectOfRecord: "", interiorDesigner: "",
  landscape: "", salesBroker: "", management: "", contractor: "",
  totalUnits: "", totalFloors: "", towers: "", residencesPerFloor: "",
  siteSF: "", amenitiesSF: "", leedCertified: "",
  priceRange: "", priceFrom: "", priceTo: "", unitSizeRange: "", bedrooms: "",
  views: "", parking: "", depositStructure: "",
  locationNote: "",
  accentColor: "#2D9FBF",
  renderings: [], floorPlanImages: [], brokerDocs: [],
  amenities: [], floorPlans: [], keyFacts: [],
};

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32, flexWrap: "wrap" }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{
          padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: i === current ? T.accent : i < current ? "#e8f5e9" : T.bgAlt,
          color: i === current ? "#fff" : i < current ? "#2e7d32" : T.textMuted,
          border: `1px solid ${i === current ? T.accent : i < current ? "#a5d6a7" : T.border}`,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{i < current ? "✓ " : ""}{s}</div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", half }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: half ? "1 1 45%" : "1 1 100%" }}>
      <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
          fontSize: 13, color: T.text, background: T.bg, outline: "none",
          fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 100%" }}>
      <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
          fontSize: 13, color: T.text, background: T.bg, outline: "none",
          fontFamily: "inherit", cursor: "pointer",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Step 0: Choose method ─────────────────────────────────────────────────────
function StepMethod({ onChoose }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 300, fontFamily: "Georgia, serif" }}>Add a New Building</h2>
      <p style={{ margin: "0 0 24px", color: T.textSub, fontSize: 14 }}>How would you like to start?</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { icon: "🔍", title: "Scrape a Website", desc: "Enter the project's URL — we'll extract images, contact info, and PDFs automatically.", value: "scrape" },
          { icon: "✏️", title: "Manual Entry", desc: "Fill out the form step by step with all the building details.", value: "manual" },
        ].map(opt => (
          <div key={opt.value} onClick={() => onChoose(opt.value)}
            style={{
              padding: 24, borderRadius: 10, border: `1px solid ${T.border}`,
              cursor: "pointer", background: T.bgCard,
              transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.bg; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{opt.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 6 }}>{opt.title}</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Scrape ────────────────────────────────────────────────────────────
function StepScrape({ project, setProject, method, onNext }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectedPdfs, setSelectedPdfs] = useState(new Set());

  const scrape = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/scrape-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      // Pre-select all images and pdfs
      setSelectedImages(new Set(data.images.map((_, i) => i)));
      setSelectedPdfs(new Set(data.pdfs.map((_, i) => i)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyAndContinue = () => {
    if (!result) { onNext(); return; }
    const imgs = result.images.filter((_, i) => selectedImages.has(i));
    const renderings = imgs.map(img => ({ url: img.url, caption: img.caption, category: img.category }));
    const brokerDocs = result.pdfs
      .filter((p, i) => selectedPdfs.has(i) && p.type === "brokerDoc")
      .map(p => ({ name: p.name, thumb: null, pdf: p.url }));
    const floorPlanImages = result.pdfs
      .filter((p, i) => selectedPdfs.has(i) && p.type === "floorplan")
      .map(p => ({ name: p.name, thumb: null, pdf: p.url }));

    // Apply ALL extracted fields — only overwrite if scraper found something
    setProject(prev => ({
      ...prev,
      id: result.suggestedId || prev.id,
      name: result.suggestedName || prev.name,
      tagline: result.tagline || prev.tagline,
      address: result.address || prev.address,
      phone: result.phone || prev.phone,
      phone2: result.phone2 || prev.phone2,
      email: result.email || prev.email,
      website: result.website || prev.website,
      instagram: result.instagram || prev.instagram,
      status: result.status || prev.status,
      salesLaunch: result.salesLaunch || prev.salesLaunch,
      estimatedDelivery: result.estimatedDelivery || prev.estimatedDelivery,
      developer: result.developer || prev.developer,
      architect: result.architect || prev.architect,
      interiorDesigner: result.interiorDesigner || prev.interiorDesigner,
      totalUnits: result.totalUnits || prev.totalUnits,
      totalFloors: result.totalFloors || prev.totalFloors,
      priceRange: result.priceRange || prev.priceRange,
      priceFrom: result.priceFrom || prev.priceFrom,
      unitSizeRange: result.unitSizeRange || prev.unitSizeRange,
      bedrooms: result.bedrooms || prev.bedrooms,
      keyFacts: result.keyFacts?.length ? result.keyFacts : prev.keyFacts,
      renderings,
      brokerDocs,
      floorPlanImages,
    }));
    onNext();
  };

  if (method === "manual") {
    return (
      <div>
        <h3 style={{ margin: "0 0 16px", fontWeight: 400, fontSize: 18 }}>Manual Entry</h3>
        <p style={{ color: T.textSub, fontSize: 13, marginBottom: 24 }}>Fill in the building details in the following steps. You can also paste a website URL to pre-fill some fields.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Optional: paste project website URL to pre-fill..."
            style={{ flex: 1, padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
          <button onClick={scrape} disabled={!url || loading}
            style={{ padding: "9px 20px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>
        {error && <div style={{ marginTop: 12, color: "#c00", fontSize: 13 }}>Error: {error}</div>}
        {result && <div style={{ marginTop: 12, color: "#2e7d32", fontSize: 13 }}>✓ Found {result.images.length} images and {result.pdfs.length} PDFs. They'll be pre-filled as you continue.</div>}
        <button onClick={applyAndContinue} style={{ marginTop: 24, padding: "10px 28px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontWeight: 400, fontSize: 18 }}>Scrape Project Website</h3>
      <p style={{ color: T.textSub, fontSize: 13, marginBottom: 20 }}>Enter the project's main URL. We'll scan it for images, PDFs, contact info, and pricing.</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://projectwebsite.com"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit" }} />
        <button onClick={scrape} disabled={!url || loading}
          style={{ padding: "10px 24px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, opacity: (!url || loading) ? 0.5 : 1 }}>
          {loading ? "Scanning..." : "🔍 Scan"}
        </button>
      </div>
      {error && <div style={{ padding: "10px 14px", borderRadius: 6, background: "#fff5f5", border: "1px solid #ffcccc", color: "#c00", fontSize: 13 }}>Error: {error}</div>}

      {result && (
        <div>
          <div style={{ padding: "12px 16px", borderRadius: 6, background: "#f0fff4", border: "1px solid #a5d6a7", marginBottom: 20, fontSize: 13, color: "#2e7d32" }}>
            ✓ Found <strong>{result.images.length}</strong> images and <strong>{result.pdfs.length}</strong> PDFs. Review and select below.
          </div>

          {result.images.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Images — select to include ({selectedImages.size} selected)
                <button onClick={() => setSelectedImages(new Set(result.images.map((_, i) => i)))}
                  style={{ marginLeft: 12, fontSize: 11, color: T.accent, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Select all</button>
                <button onClick={() => setSelectedImages(new Set())}
                  style={{ marginLeft: 8, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {result.images.map((img, i) => (
                  <div key={i} onClick={() => {
                    const s = new Set(selectedImages);
                    s.has(i) ? s.delete(i) : s.add(i);
                    setSelectedImages(s);
                  }} style={{
                    position: "relative", aspectRatio: "4/3", borderRadius: 6, overflow: "hidden",
                    border: `2px solid ${selectedImages.has(i) ? "#2e7d32" : T.border}`,
                    cursor: "pointer", background: T.bgAlt,
                  }}>
                    <img src={img.url} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => e.target.style.display = "none"} />
                    {selectedImages.has(i) && (
                      <div style={{ position: "absolute", top: 4, right: 4, background: "#2e7d32", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "2px 4px", fontSize: 9, color: "#fff" }}>{img.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.pdfs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>PDFs Found</div>
              {result.pdfs.map((pdf, i) => (
                <div key={i} onClick={() => {
                  const s = new Set(selectedPdfs);
                  s.has(i) ? s.delete(i) : s.add(i);
                  setSelectedPdfs(s);
                }} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6,
                  border: `1px solid ${selectedPdfs.has(i) ? "#2e7d32" : T.border}`,
                  background: selectedPdfs.has(i) ? "#f0fff4" : T.bg, cursor: "pointer", marginBottom: 6,
                }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{pdf.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{pdf.type === "floorplan" ? "Floor Plan" : "Broker Doc"}</div>
                  </div>
                  {selectedPdfs.has(i) && <span style={{ color: "#2e7d32", fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          <button onClick={applyAndContinue}
            style={{ padding: "11px 28px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Use Selected & Continue →
          </button>
        </div>
      )}

      {!result && !loading && (
        <button onClick={onNext} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 6, background: T.bgAlt, color: T.textSub, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 13 }}>
          Skip, fill manually →
        </button>
      )}
    </div>
  );
}

// ── Step 2: Basic Info ────────────────────────────────────────────────────────
function StepBasic({ project, setProject }) {
  const set = key => val => setProject(p => ({ ...p, [key]: val }));
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontWeight: 400, fontSize: 18 }}>Basic Information</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Building ID (no spaces)" value={project.id} onChange={val => setProject(p => ({ ...p, id: val.toLowerCase().replace(/[^a-z0-9]/g, '') }))} placeholder="e.g. olara" half />
          <Field label="Building Name" value={project.name} onChange={set("name")} placeholder="e.g. Olara" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Subtitle" value={project.subtitle} onChange={set("subtitle")} placeholder="e.g. North Flagler" half />
          <Field label="Tagline" value={project.tagline} onChange={set("tagline")} placeholder="Short marketing tagline" half />
        </div>
        <Field label="Address" value={project.address} onChange={set("address")} placeholder="Full street address" />
        <Field label="Location Note" value={project.locationNote} onChange={set("locationNote")} placeholder="e.g. North Flagler Drive waterfront — 4-acre site" />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Phone" value={project.phone} onChange={set("phone")} placeholder="561.000.0000" half />
          <Field label="Phone 2" value={project.phone2} onChange={set("phone2")} placeholder="Optional" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Email" value={project.email} onChange={set("email")} placeholder="info@building.com" half />
          <Field label="Website" value={project.website} onChange={set("website")} placeholder="buildingwebsite.com" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Sales Gallery Address" value={project.salesGallery} onChange={set("salesGallery")} placeholder="Gallery address" half />
          <Field label="Instagram URL" value={project.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Select label="Status" value={project.status} onChange={set("status")} options={["Pre-Construction / Sales Launched", "Under Construction", "Completed"]} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Sales Launch" value={project.salesLaunch} onChange={set("salesLaunch")} placeholder="e.g. January 2024" half />
          <Field label="Estimated Delivery" value={project.estimatedDelivery} onChange={set("estimatedDelivery")} placeholder="e.g. Q1 2028" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Construction Start" value={project.constructionStart} onChange={set("constructionStart")} placeholder="e.g. March 2024" half />
          <Field label="Construction Loan" value={project.constructionLoan} onChange={set("constructionLoan")} placeholder="e.g. $380M — Lender Name" half />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Accent Color</label>
            <input type="color" value={project.accentColor || "#2D9FBF"} onChange={e => setProject(p => ({ ...p, accentColor: e.target.value }))}
              style={{ width: 60, height: 36, borderRadius: 6, border: `1px solid ${T.border}`, cursor: "pointer", padding: 2 }} />
          </div>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 18 }}>Used for nav tab underline, price display, and accent details</div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Team ──────────────────────────────────────────────────────────────
function StepTeam({ project, setProject }) {
  const set = key => val => setProject(p => ({ ...p, [key]: val }));
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontWeight: 400, fontSize: 18 }}>Development Team</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          ["developer", "Developer", "e.g. Kolter Urban + Perko Development Partners"],
          ["architect", "Architect", "e.g. Arquitectonica"],
          ["architectOfRecord", "Architect of Record", "Optional"],
          ["interiorDesigner", "Interior Designer", "e.g. Gabellini Sheppard Associates"],
          ["landscape", "Landscape", "e.g. EDSA"],
          ["salesBroker", "Sales Broker", "e.g. Compass (exclusive)"],
          ["management", "Management", "e.g. Arch Amenities"],
          ["contractor", "Contractor", "Optional"],
        ].map(([key, label, placeholder]) => (
          <Field key={key} label={label} value={project[key]} onChange={set(key)} placeholder={placeholder} />
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Building Specs ────────────────────────────────────────────────────
function StepBuilding({ project, setProject }) {
  const set = key => val => setProject(p => ({ ...p, [key]: val }));
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontWeight: 400, fontSize: 18 }}>Building Specifications</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Total Units" value={project.totalUnits} onChange={set("totalUnits")} placeholder="e.g. 287" half type="number" />
          <Field label="Total Floors" value={project.totalFloors} onChange={set("totalFloors")} placeholder="e.g. 26" half type="number" />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Towers" value={project.towers} onChange={set("towers")} placeholder="e.g. 2 (or leave blank)" half />
          <Field label="Residences Per Floor" value={project.residencesPerFloor} onChange={set("residencesPerFloor")} placeholder="e.g. 4" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Site Area" value={project.siteSF} onChange={set("siteSF")} placeholder="e.g. 4 acres" half />
          <Field label="Amenity Space" value={project.amenitiesSF} onChange={set("amenitiesSF")} placeholder="e.g. 80,000+ SF" half />
        </div>
        <Field label="LEED / Certification" value={project.leedCertified} onChange={set("leedCertified")} placeholder="e.g. LEED Gold (or leave blank)" />
      </div>
    </div>
  );
}

// ── Step 5: Pricing ───────────────────────────────────────────────────────────
function StepPricing({ project, setProject }) {
  const set = key => val => setProject(p => ({ ...p, [key]: val }));
  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontWeight: 400, fontSize: 18 }}>Pricing & Units</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Price Range (display)" value={project.priceRange} onChange={set("priceRange")} placeholder="e.g. $1.95M – $8M+" half />
          <Field label="Bedrooms" value={project.bedrooms} onChange={set("bedrooms")} placeholder="e.g. 2–4 Bedrooms" half />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Price From ($)" value={project.priceFrom} onChange={set("priceFrom")} placeholder="e.g. 1950000" half type="number" />
          <Field label="Price To ($)" value={project.priceTo} onChange={set("priceTo")} placeholder="e.g. 8000000" half type="number" />
        </div>
        <Field label="Unit Size Range" value={project.unitSizeRange} onChange={set("unitSizeRange")} placeholder="e.g. 1,483 – 4,110 SF interior" />
        <Field label="Views" value={project.views} onChange={set("views")} placeholder="e.g. Intracoastal Waterway, Atlantic Ocean..." />
        <Field label="Parking" value={project.parking} onChange={set("parking")} placeholder="e.g. 2 full-size spots included (EV capable)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Deposit Structure (one per line)</label>
          <textarea value={project.depositStructure || ""} onChange={e => setProject(p => ({ ...p, depositStructure: e.target.value }))}
            placeholder={"10% at Reservation\n10% at Hard Contract\n60% at Closing"}
            rows={4}
            style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Key Facts (one per line)</label>
          <textarea value={Array.isArray(project.keyFacts) ? project.keyFacts.join("\n") : project.keyFacts || ""} onChange={e => setProject(p => ({ ...p, keyFacts: e.target.value.split("\n").filter(Boolean) }))}
            placeholder={"287 condos across two 26-story towers\n$380M construction financing secured\nJosé Andrés restaurant on site"}
            rows={5}
            style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
        </div>
      </div>
    </div>
  );
}

// ── Step 6: Gallery ───────────────────────────────────────────────────────────
function StepGallery({ project, setProject }) {
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("Exterior");
  const CATEGORIES = ["Exterior", "Arrival", "Residences", "Views", "Amenities", "Dining", "Marina", "Other"];

  const addImage = () => {
    if (!newUrl.trim()) return;
    setProject(p => ({ ...p, renderings: [...(p.renderings || []), { url: newUrl.trim(), caption: newCaption.trim(), category: newCategory }] }));
    setNewUrl(""); setNewCaption("");
  };

  const removeImage = i => setProject(p => ({ ...p, renderings: p.renderings.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontWeight: 400, fontSize: 18 }}>Gallery Images</h3>
      <p style={{ color: T.textSub, fontSize: 13, marginBottom: 20 }}>
        {(project.renderings || []).length > 0
          ? `${project.renderings.length} images loaded from scrape. Add more or remove any below.`
          : "Add gallery image URLs one by one, or skip — you can add images later."}
      </p>

      {(project.renderings || []).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
          {project.renderings.map((img, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`, background: T.bgAlt }}>
              <img src={img.url} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "2px 4px", fontSize: 9, color: "#fff" }}>{img.category}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgCard }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Add Image</div>
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Image URL"
          style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="Caption (optional)"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={addImage} disabled={!newUrl.trim()}
            style={{ padding: "8px 16px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: !newUrl.trim() ? 0.5 : 1 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 7: Floor Plans ───────────────────────────────────────────────────────
function StepFloorPlans({ project, setProject }) {
  const [newName, setNewName] = useState("");
  const [newThumb, setNewThumb] = useState("");
  const [newPdf, setNewPdf] = useState("");

  const add = () => {
    if (!newName.trim()) return;
    setProject(p => ({ ...p, floorPlanImages: [...(p.floorPlanImages || []), { name: newName.trim(), thumb: newThumb.trim() || null, pdf: newPdf.trim() || null }] }));
    setNewName(""); setNewThumb(""); setNewPdf("");
  };

  const remove = i => setProject(p => ({ ...p, floorPlanImages: p.floorPlanImages.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontWeight: 400, fontSize: 18 }}>Floor Plans</h3>
      <p style={{ color: T.textSub, fontSize: 13, marginBottom: 20 }}>
        {(project.floorPlanImages || []).length > 0
          ? `${project.floorPlanImages.length} floor plan PDFs loaded from scrape.`
          : "Add floor plan images and PDFs. You can skip and add these later."}
      </p>

      {(project.floorPlanImages || []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20, maxHeight: 220, overflowY: "auto" }}>
          {project.floorPlanImages.map((fp, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg }}>
              <span style={{ fontSize: 16 }}>📐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{fp.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{fp.thumb ? "Has thumbnail" : "No thumbnail"} · {fp.pdf ? "Has PDF" : "No PDF"}</div>
              </div>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgCard }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Add Floor Plan</div>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (e.g. Plan A, Residence A1)"
          style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
        <input value={newThumb} onChange={e => setNewThumb(e.target.value)} placeholder="Thumbnail image URL (optional)"
          style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newPdf} onChange={e => setNewPdf(e.target.value)} placeholder="PDF URL (optional)"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit" }} />
          <button onClick={add} disabled={!newName.trim()}
            style={{ padding: "8px 16px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 8: Review & Save ─────────────────────────────────────────────────────
function StepReview({ project, onSave, saving, saveResult, saveError }) {
  const checks = [
    ["Building ID", project.id, "Required"],
    ["Name", project.name, "Required"],
    ["Address", project.address, ""],
    ["Developer", project.developer, ""],
    ["Price Range", project.priceRange, ""],
    ["Gallery Images", `${(project.renderings || []).length} images`, ""],
    ["Floor Plans", `${(project.floorPlanImages || []).length} plans`, ""],
  ];

  const missingRequired = !project.id || !project.name;

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontWeight: 400, fontSize: 18 }}>Review & Save</h3>
      <p style={{ color: T.textSub, fontSize: 13, marginBottom: 24 }}>Review the summary below, then save. Vercel will automatically redeploy — the building will be live in ~60 seconds.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 24 }}>
        {checks.map(([label, value, note], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", padding: "10px 16px", background: i % 2 === 0 ? T.bgAlt : T.bg, borderBottom: i < checks.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label} {note && <span style={{ color: "#c00" }}>*</span>}</div>
            <div style={{ fontSize: 13, color: value ? T.text : T.textMuted, fontStyle: value ? "normal" : "italic" }}>{value || "Not set"}</div>
          </div>
        ))}
      </div>

      {missingRequired && (
        <div style={{ padding: "10px 16px", borderRadius: 6, background: "#fff5f5", border: "1px solid #ffcccc", color: "#c00", fontSize: 13, marginBottom: 16 }}>
          Building ID and Name are required before saving.
        </div>
      )}

      {saveError && (
        <div style={{ padding: "10px 16px", borderRadius: 6, background: "#fff5f5", border: "1px solid #ffcccc", color: "#c00", fontSize: 13, marginBottom: 16 }}>
          Error: {saveError}
        </div>
      )}

      {saveResult && (
        <div style={{ padding: "16px", borderRadius: 6, background: "#f0fff4", border: "1px solid #a5d6a7", color: "#2e7d32", fontSize: 13, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>✓ {saveResult.message}</div>
          <div>The page will refresh automatically when the redeploy is complete.</div>
        </div>
      )}

      {!saveResult && (
        <button onClick={onSave} disabled={saving || missingRequired}
          style={{
            padding: "13px 32px", borderRadius: 6, background: T.accent, color: "#fff",
            border: "none", cursor: saving || missingRequired ? "default" : "pointer",
            fontSize: 15, fontWeight: 700, opacity: saving || missingRequired ? 0.5 : 1,
            letterSpacing: "0.02em",
          }}>
          {saving ? "⏳ Saving..." : "🚀 Save & Deploy Building"}
        </button>
      )}
    </div>
  );
}

// ── Main AddProject Component ─────────────────────────────────────────────────
export default function AddProject({ onClose }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null);
  const [project, setProject] = useState({ ...EMPTY_PROJECT });
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const chooseMethod = (m) => { setMethod(m); setStep(1); };

  const save = async () => {
    setSaving(true); setSaveError(null);
    try {
      // Clean up project data
      const cleaned = {
        ...project,
        totalUnits: project.totalUnits ? parseInt(project.totalUnits) : null,
        totalFloors: project.totalFloors ? parseInt(project.totalFloors) : null,
        priceFrom: project.priceFrom ? parseInt(project.priceFrom) : null,
        priceTo: project.priceTo ? parseInt(project.priceTo) : null,
        depositStructure: typeof project.depositStructure === "string"
          ? project.depositStructure.split("\n").filter(Boolean)
          : project.depositStructure,
        darkColor: "#111111",
        theme: "custom",
      };

      const res = await fetch("/api/save-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveResult(data);

      // Auto-reload after 75 seconds (Vercel redeploy time)
      setTimeout(() => window.location.reload(), 75000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepMethod onChoose={chooseMethod} />;
      case 1: return <StepScrape project={project} setProject={setProject} method={method} onNext={next} />;
      case 2: return <StepBasic project={project} setProject={setProject} />;
      case 3: return <StepTeam project={project} setProject={setProject} />;
      case 4: return <StepBuilding project={project} setProject={setProject} />;
      case 5: return <StepPricing project={project} setProject={setProject} />;
      case 6: return <StepGallery project={project} setProject={setProject} />;
      case 7: return <StepFloorPlans project={project} setProject={setProject} />;
      case 8: return <StepReview project={project} onSave={save} saving={saving} saveResult={saveResult} saveError={saveError} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Modern Living Group</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Add New Building</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 16px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>
          ✕ Cancel
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 32px" }}>
        {step > 0 && <StepIndicator current={step} total={STEPS.length} />}
        {renderStep()}

        {/* Nav buttons — not shown on step 0 or scrape step (has its own) */}
        {step > 1 && step < 8 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <button onClick={back} style={{ padding: "10px 24px", borderRadius: 6, background: T.bgAlt, color: T.textSub, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>
              ← Back
            </button>
            <button onClick={next} style={{ padding: "10px 28px", borderRadius: 6, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Continue →
            </button>
          </div>
        )}
        {step === 1 && method !== "scrape" && (
          <div style={{ display: "flex", marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <button onClick={back} style={{ padding: "10px 24px", borderRadius: 6, background: T.bgAlt, color: T.textSub, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>
              ← Back
            </button>
          </div>
        )}
        {step === 8 && !saveResult && (
          <div style={{ display: "flex", marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <button onClick={back} style={{ padding: "10px 24px", borderRadius: 6, background: T.bgAlt, color: T.textSub, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
