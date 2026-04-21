// MLG New Construction Tool v1.0.1
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PROJECTS_DATA from "./data/index.js";
import AddProject from "./AddProject.jsx";

const PROJECTS = PROJECTS_DATA;

function fmt(n) {
  if (!n) return "Contact for pricing";
  return "$" + (n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2) + "M" : n.toLocaleString());
}

// Modal overlay needs dark bg — injected as style tag to beat global CSS overrides
const MODAL_STYLE = `
  .gallery-modal-overlay {
    background: rgba(0,0,0,0.92) !important;
    background-color: rgba(0,0,0,0.92) !important;
  }
`;

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

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.92)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "fixed", top: 18, right: 24, background: "none", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", opacity: 0.7, zIndex: 100000 }}>✕</button>
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
    </div>,
    document.body
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
  const [showAdd, setShowAdd] = useState(false);
  const projectList = Object.values(PROJECTS);

  if (showAdd) return <AddProject onClose={() => setShowAdd(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", colorScheme: "light" }}>
      <style>{MODAL_STYLE}</style>
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
        <button onClick={() => setShowAdd(true)} style={{ padding: "16px 18px", background: "transparent", border: "none", color: T.textSub, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", borderBottom: "2px solid transparent" }}>
          + Add Building
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
