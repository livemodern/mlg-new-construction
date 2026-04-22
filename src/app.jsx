// src/app.jsx — MLG New Construction Tool v3
// Mobile-first, KV-backed, fully editable
import { useState, useEffect, useCallback, useRef } from "react";
import AddProject from "./AddProject.jsx";

// ── Theme (locked) ────────────────────────────────────────────────────────
const T = {
  bg:           "#ffffff",
  bgAlt:        "#f7f7f7",
  bgCard:       "#f9f9f9",
  bgNav:        "#ffffff",
  bgSection:    "#f4f4f4",
  border:       "#e5e5e5",
  borderStrong: "#d0d0d0",
  text:         "#111111",
  textSub:      "#555555",
  textMuted:    "#999999",
  textInverse:  "#ffffff",
  navText:      "#333333",
  footerBg:     "#f4f4f4",
  footerText:   "#aaaaaa",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n) return "Contact for pricing";
  return "$" + (n >= 1000000 ? (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M" : n.toLocaleString());
}
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// ── ProjectBadge ─────────────────────────────────────────────────────────
function ProjectBadge({ status }) {
  const isBuilding = status === "Under Construction";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: isBuilding ? "#e8f5e9" : "#fff8e1",
      color: isBuilding ? "#2e7d32" : "#e65100",
      border: `1px solid ${isBuilding ? "#a5d6a7" : "#ffcc80"}`,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      padding: "3px 9px", borderRadius: 20, textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {status}
    </span>
  );
}

// ── GalleryModal ──────────────────────────────────────────────────────────
function GalleryModal({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const img = images[idx];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "fixed", top: 16, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 100000, padding: "8px 12px" }}>✕</button>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, maxWidth: "92vw" }}>
        <img src={img.url} alt={img.caption} style={{ maxWidth: "92vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 4 }} onError={e => e.target.alt = "Image unavailable"} />
        <div style={{ color: "#eee", fontSize: 13, textAlign: "center" }}>{img.caption}<span style={{ color: "#aaa", marginLeft: 8 }}>— {img.category}</span></div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === 0 ? "#555" : "#fff", padding: "10px 20px", borderRadius: 4, cursor: idx === 0 ? "default" : "pointer", fontSize: 18 }}>‹</button>
          <span style={{ color: "#aaa", fontSize: 12 }}>{idx + 1} / {images.length}</span>
          <button onClick={() => setIdx(i => Math.min(i + 1, images.length - 1))} disabled={idx === images.length - 1} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === images.length - 1 ? "#555" : "#fff", padding: "10px 20px", borderRadius: 4, cursor: idx === images.length - 1 ? "default" : "pointer", fontSize: 18 }}>›</button>
        </div>
      </div>
    </div>
  );
}

// ── RenderingGallery ──────────────────────────────────────────────────────
function RenderingGallery({ renderings, accent }) {
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const cats = ["All", ...Array.from(new Set(renderings.map(r => r.category)))];
  const filtered = filter === "All" ? renderings : renderings.filter(r => r.category === filter);
  if (!renderings.length) return <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "40px 0" }}>No gallery images loaded yet.</div>;
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: `1px solid ${filter === c ? accent : T.border}`,
            background: filter === c ? accent : T.bg,
            color: filter === c ? T.textInverse : T.textSub,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {filtered.map((img, i) => {
          const globalIdx = renderings.indexOf(img);
          return (
            <div key={i} onClick={() => setModal(globalIdx)} style={{ cursor: "pointer", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative", aspectRatio: "4/3", background: T.bgAlt }}>
              <img src={img.url} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.65))", padding: "18px 8px 6px", fontSize: 10, color: "#fff" }}>{img.caption}</div>
            </div>
          );
        })}
      </div>
      {modal !== null && <GalleryModal images={renderings} startIndex={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

// ── PricingTab ────────────────────────────────────────────────────────────
function PricingTab({ buildingId, accent }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    fetch("/api/pricing?buildingId=" + buildingId)
      .then(r => r.json())
      .then(data => { setUnits(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [buildingId]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      if (file.name.endsWith(".pdf")) {
        const buf = await file.arrayBuffer();
        const r = await fetch("/api/upload-pdf", {
          method: "POST",
          headers: {
            "x-building-id": buildingId,
            "x-doc-name": file.name.replace(".pdf", ""),
            "x-context": "pricing sheet or availability list",
          },
          body: buf,
        });
        const data = await r.json();
        if (data.extracted?.pricing?.length) {
          const newUnits = data.extracted.pricing.map((u, i) => ({ ...u, id: u.id || (buildingId + "-" + i) }));
          const r2 = await fetch("/api/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buildingId, units: newUnits }) });
          if (r2.ok) { setUnits(newUnits); setMsg("✓ Pricing updated — " + newUnits.length + " units loaded from PDF"); }
        } else {
          setMsg("PDF processed but no pricing data found. Try uploading a CSV instead.");
        }
      } else if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
        const text = await file.text();
        const lines = text.trim().split("\n").filter(Boolean);
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
        const newUnits = lines.slice(1).map((line, i) => {
          const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const u = {};
          headers.forEach((h, j) => u[h] = vals[j] || "");
          return {
            id: u.unit || u.id || (buildingId + "-" + i),
            unit: u.unit || u.unitnumber || "",
            floor: parseInt(u.floor) || null,
            model: u.model || u.type || "",
            beds: parseFloat(u.beds || u.bedrooms) || null,
            baths: parseFloat(u.baths || u.bathrooms) || null,
            sqft: parseInt(u.sqft || u.sf || u.size) || null,
            price: parseFloat((u.price || u.listprice || "0").replace(/[$,]/g, "")) || null,
            status: u.status || "Available",
            exposure: u.exposure || u.view || "",
            terrace: parseInt(u.terrace || u.outdoor) || null,
          };
        }).filter(u => u.unit || u.price);
        const r2 = await fetch("/api/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buildingId, units: newUnits }) });
        if (r2.ok) { setUnits(newUnits); setMsg("✓ Pricing updated — " + newUnits.length + " units loaded from CSV"); }
      }
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  if (loading) return <div style={{ color: T.textMuted, padding: "32px 0", textAlign: "center" }}>Loading pricing...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{units.length} Units</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Upload new CSV or PDF pricing sheet to replace current inventory</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "10px 16px", background: accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
            {uploading ? "Processing..." : "⬆ Upload New Pricing"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.csv,.txt" style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </div>
      {msg && <div style={{ padding: "10px 14px", background: msg.startsWith("✓") ? "#e8f5e9" : "#fff3e0", border: `1px solid ${msg.startsWith("✓") ? "#a5d6a7" : "#ffcc80"}`, borderRadius: 6, fontSize: 13, marginBottom: 16, color: msg.startsWith("✓") ? "#2e7d32" : "#e65100" }}>{msg}</div>}
      {units.length === 0 ? (
        <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No pricing loaded. Upload a CSV or PDF pricing sheet to get started.</div>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bgAlt }}>
                {["Unit", "Floor", "Model", "Beds", "Baths", "Sq Ft", "Terrace", "Exposure", "Price", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => (
                <tr key={u.id || i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.bg : T.bgAlt }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.unit || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.floor || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.model || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.beds || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.baths || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.sqft ? u.sqft.toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.terrace ? u.terrace.toLocaleString() + " SF" : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.exposure || "—"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: accent }}>{u.price ? fmt(u.price) : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: u.status === "Available" ? "#e8f5e9" : u.status === "Sold" ? "#ffebee" : "#fff8e1", color: u.status === "Available" ? "#2e7d32" : u.status === "Sold" ? "#c62828" : "#e65100" }}>{u.status || "Available"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── EditModal ─────────────────────────────────────────────────────────────
function EditModal({ building, onSave, onClose }) {
  const [data, setData] = useState({ ...building });
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  async function handleSave() {
    setSaving(true);
    try {
      const r = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id || data.suggestedId, data }),
      });
      if (r.ok) onSave(data);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  }

  const FI = ({ label, k, placeholder, type = "text" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input
        type={type}
        value={data[k] || ""}
        placeholder={placeholder || ""}
        onChange={e => set(k, e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit" }}
      />
    </div>
  );

  const SI = ({ label, k, options }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <select value={data[k] || ""} onChange={e => set(k, e.target.value)} style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const SectionHead = ({ label }) => (
    <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: 16, paddingBottom: 4, borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>{label}</div>
  );

  const Grid = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>{children}</div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: T.bg, width: isMobile ? "100%" : 620, maxHeight: isMobile ? "92vh" : "88vh", borderRadius: isMobile ? "16px 16px 0 0" : 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Edit: {data.suggestedName || "Building"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textMuted, padding: "4px 8px" }}>✕</button>
        </div>
        {/* Form */}
        <div style={{ overflowY: "auto", padding: 20, flex: 1, WebkitOverflowScrolling: "touch" }}>
          <SectionHead label="Identity" />
          <Grid>
            <FI label="Building Name" k="suggestedName" />
            <FI label="Subtitle" k="subtitle" placeholder="e.g. South Flagler" />
            <FI label="Tagline" k="tagline" />
            <FI label="Accent Color" k="accentColor" type="color" />
          </Grid>
          <SectionHead label="Status & Timeline" />
          <Grid>
            <SI label="Status" k="status" options={["Pre-Construction / Sales Launched", "Under Construction", "Completed"]} />
            <FI label="Sales Launch" k="salesLaunch" placeholder="January 2024" />
            <FI label="Est. Delivery" k="estimatedDelivery" placeholder="Q4 2027" />
            <FI label="Construction Start" k="constructionStart" placeholder="April 2024" />
            <FI label="Construction Loan" k="constructionLoan" placeholder="$380M — Lender Name" />
          </Grid>
          <SectionHead label="Contact" />
          <Grid>
            <FI label="Address" k="address" />
            <FI label="Sales Gallery" k="salesGallery" />
            <FI label="Phone" k="phone" placeholder="561.XXX.XXXX" />
            <FI label="Phone 2" k="phone2" />
            <FI label="Email" k="email" />
            <FI label="Website" k="website" placeholder="domain.com" />
            <FI label="Instagram URL" k="instagram" />
          </Grid>
          <SectionHead label="Team" />
          <Grid>
            <FI label="Developer" k="developer" />
            <FI label="Architect" k="architect" />
            <FI label="Interior Designer" k="interiorDesigner" />
            <FI label="Landscape" k="landscape" />
            <FI label="Sales Broker" k="salesBroker" />
            <FI label="Management" k="management" />
            <FI label="Contractor" k="contractor" />
          </Grid>
          <SectionHead label="Building Specs" />
          <Grid>
            <FI label="Total Units" k="totalUnits" type="number" />
            <FI label="Total Floors" k="totalFloors" type="number" />
            <FI label="Towers" k="towers" type="number" />
            <FI label="Residences Per Floor" k="residencesPerFloor" />
            <FI label="Site Area" k="siteSF" placeholder="e.g. 4 acres" />
            <FI label="Amenity Space" k="amenitiesSF" placeholder="e.g. 50,000 SF" />
            <FI label="LEED Certification" k="leedCertified" placeholder="LEED Gold" />
          </Grid>
          <SectionHead label="Pricing & Units" />
          <Grid>
            <FI label="Price Range" k="priceRange" placeholder="$5M – $15M+" />
            <FI label="Price From (number)" k="priceFrom" type="number" />
            <FI label="Unit Size Range" k="unitSizeRange" placeholder="1,483 – 4,110 SF interior" />
            <FI label="Bedrooms" k="bedrooms" placeholder="2–4 Bedrooms" />
            <FI label="Views" k="views" />
            <FI label="Parking" k="parking" />
          </Grid>
          <SectionHead label="Location" />
          <Grid>
            <FI label="Location Note" k="locationNote" />
          </Grid>
        </div>
        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer", color: T.text, fontWeight: 600, minHeight: 44 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", background: data.accentColor || "#2a2a2a", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 700, minHeight: 44 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProjectView ───────────────────────────────────────────────────────────
function ProjectView({ project, onEdit, onDelete }) {
  const TABS = ["Overview", "Floor Plans", "Amenities", "Gallery", "Pricing", "Broker Toolkit"];
  const [tab, setTab] = useState("Overview");
  const isMobile = useIsMobile();
  const accent = project.accentColor || "#2D9FBF";

  const Detail = ({ label, value }) => value ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, color: T.text }}>{value}</div>
    </div>
  ) : null;

  return (
    <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      {/* Building header */}
      <div style={{ padding: isMobile ? "16px 16px 0" : "24px 32px 0", background: T.bg }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column-reverse" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", gap: isMobile ? 6 : 12, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{project.subtitle}</div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 300, color: T.text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{project.suggestedName || project.name}</h1>
            {project.tagline && <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{project.tagline}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "center" : "flex-end", gap: 8, flexShrink: 0 }}>
            <ProjectBadge status={project.status || "Pre-Construction / Sales Launched"} />
            <button onClick={onEdit} style={{ padding: "8px 14px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer", color: T.textSub, fontWeight: 600, minHeight: 36 }}>Edit</button>
          </div>
        </div>
        {project.priceRange && (
          <div style={{ marginTop: 8, marginBottom: 4 }}>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>{project.priceRange}</div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Starting price range</div>
          </div>
        )}
        {/* Spec strip */}
        <div style={{ display: "flex", gap: 0, marginTop: 12, borderTop: `1px solid ${T.border}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            ["Units", project.totalUnits],
            ["Floors", project.totalFloors],
            ["Developer", project.developer],
            ["Architect", project.architect],
            ["Est. Delivery", project.estimatedDelivery || "TBD"],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ padding: "10px 16px", borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{k}</div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500, color: T.text, whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{String(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content tabs */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.bg, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", minWidth: "max-content", padding: `0 ${isMobile ? 16 : 32}px` }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 14px", background: "none", border: "none",
              borderBottom: `2px solid ${tab === t ? accent : "transparent"}`,
              color: tab === t ? accent : T.textSub,
              fontSize: 13, fontWeight: tab === t ? 700 : 400,
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>{t}{t === "Gallery" && project.renderings?.length ? ` (${project.renderings.length})` : ""}{t === "Floor Plans" && project.floorPlanImages?.length ? ` (${project.floorPlanImages.length})` : ""}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: isMobile ? "16px" : "28px 32px", minHeight: 300 }}>
        {/* OVERVIEW */}
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 40 }}>
            {/* Key Facts */}
            <div>
              {project.keyFacts?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Key Highlights</div>
                  {project.keyFacts.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", marginBottom: 6, background: T.bgCard, borderRadius: 8, border: `1px solid ${T.border}`, alignItems: "flex-start" }}>
                      <span style={{ color: accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>◆</span>
                      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Property Details */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Property Details</div>
              <Detail label="Address" value={project.address} />
              <Detail label="Location" value={project.locationNote} />
              <Detail label="Views" value={project.views} />
              <Detail label="Unit Sizes" value={project.unitSizeRange} />
              <Detail label="Bedrooms" value={project.bedrooms} />
              <Detail label="Parking" value={project.parking} />
              <Detail label="Est. Delivery" value={project.estimatedDelivery} />
              <Detail label="Construction Start" value={project.constructionStart} />
              <Detail label="Interior Design" value={project.interiorDesigner} />
              <Detail label="Management" value={project.management} />
              <Detail label="Sales Broker" value={project.salesBroker} />
              <Detail label="Construction Loan" value={project.constructionLoan} />
              {/* Contact */}
              {(project.phone || project.email || project.website) && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Contact</div>
                  {project.phone && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>📞 {project.phone}</div>}
                  {project.phone2 && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>📞 {project.phone2}</div>}
                  {project.email && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>✉ {project.email}</div>}
                  {project.website && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>🌐 {project.website}</div>}
                  {project.salesGallery && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>📍 Sales Gallery: {project.salesGallery}</div>}
                  {project.instagram && <a href={project.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: accent, textDecoration: "none" }}>📸 instagram ↗</a>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOOR PLANS */}
        {tab === "Floor Plans" && (
          <div>
            {(!project.floorPlanImages || project.floorPlanImages.length === 0) && (!project.floorPlans || project.floorPlans.length === 0) ? (
              <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No floor plans loaded yet. Upload a PDF in the Add Building flow or edit this building.</div>
            ) : (
              <>
                {project.floorPlanImages?.length > 0 && <RenderingGallery renderings={project.floorPlanImages} accent={accent} />}
                {project.floorPlans?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {project.floorPlans.map((plan, i) => (
                      <div key={i} style={{ padding: "14px 16px", border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 8, background: T.bgCard }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{plan.name}</div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 4 }}>
                          {[plan.beds && plan.beds + " BR", plan.baths && plan.baths + " BA", plan.sqft && plan.sqft.toLocaleString() + " SF", plan.price && fmt(plan.price)].filter(Boolean).join("  ·  ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* AMENITIES */}
        {tab === "Amenities" && (
          <div>
            {(!project.amenities || project.amenities.length === 0) ? (
              <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No amenities listed yet.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                {project.amenities.map((a, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: accent, fontSize: 12 }}>◆</span> {a}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GALLERY */}
        {tab === "Gallery" && (
          <RenderingGallery renderings={project.renderings || []} accent={accent} />
        )}

        {/* PRICING */}
        {tab === "Pricing" && (
          <PricingTab buildingId={project.id || project.suggestedId} accent={accent} />
        )}

        {/* BROKER TOOLKIT */}
        {tab === "Broker Toolkit" && (
          <div>
            {(!project.brokerDocs || project.brokerDocs.length === 0) ? (
              <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No broker documents loaded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.brokerDocs.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer" style={{ padding: "14px 18px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, textTransform: "capitalize" }}>{doc.type}</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: accent, fontSize: 12, fontWeight: 600 }}>Open ↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const isMobile = useIsMobile();

  // Load buildings from KV
  async function loadBuildings() {
    try {
      const r = await fetch("/api/buildings");
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setBuildings(data);
          if (!activeId || !data.find(b => (b.id || b.suggestedId) === activeId)) {
            setActiveId(data[0].id || data[0].suggestedId);
          }
          setLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback: try to load static data
    try {
      const { default: staticData } = await import("./data/index.js");
      const arr = Object.values(staticData);
      if (arr.length > 0) {
        setBuildings(arr.map(b => ({ ...b, id: b.id || b.suggestedId })));
        setActiveId(arr[0].id || arr[0].suggestedId);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadBuildings(); }, []);

  // Migrate static data to KV
  async function migrateToKV() {
    setMigrating(true);
    try {
      for (const b of buildings) {
        const id = b.id || b.suggestedId;
        await fetch("/api/buildings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, data: { ...b, id } }),
        });
      }
      alert("✓ Migrated " + buildings.length + " buildings to database.");
    } catch (e) { alert("Migration error: " + e.message); }
    setMigrating(false);
  }

  function handleBuildingAdded(newBuilding) {
    const id = newBuilding.id || newBuilding.suggestedId;
    setBuildings(prev => {
      const exists = prev.findIndex(b => (b.id || b.suggestedId) === id);
      if (exists >= 0) { const next = [...prev]; next[exists] = { ...newBuilding, id }; return next; }
      return [...prev, { ...newBuilding, id }];
    });
    setActiveId(id);
    setShowAdd(false);
  }

  function handleEditSave(updated) {
    const id = updated.id || updated.suggestedId;
    setBuildings(prev => prev.map(b => (b.id || b.suggestedId) === id ? { ...updated, id } : b));
    setEditBuilding(null);
  }

  const active = buildings.find(b => (b.id || b.suggestedId) === activeId);

  if (showAdd) return (
    <AddProject
      onComplete={handleBuildingAdded}
      onCancel={() => setShowAdd(false)}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, fontFamily: "inherit", overflow: "hidden" }}>
      {/* Top nav */}
      <div style={{ background: T.bgNav, borderBottom: `1px solid ${T.border}`, padding: isMobile ? "0 12px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, minHeight: 52 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Modern Living Group</div>
          <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>New Construction Tool</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {buildings.length > 0 && !loading && (
            <button onClick={migrateToKV} disabled={migrating} title="Sync to database" style={{ padding: "7px 10px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, cursor: "pointer", color: T.textSub, display: isMobile ? "none" : "block" }}>
              {migrating ? "Syncing..." : "Sync DB"}
            </button>
          )}
          <button onClick={() => setShowAdd(true)} style={{ padding: "8px 14px", background: T.text, border: "none", borderRadius: 6, color: T.textInverse, fontSize: 13, fontWeight: 700, cursor: "pointer", minHeight: 36, whiteSpace: "nowrap" }}>+ Add</button>
        </div>
      </div>

      {/* Building tabs */}
      {buildings.length > 0 && (
        <div style={{ background: T.bgNav, borderBottom: `1px solid ${T.border}`, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", minWidth: "max-content", padding: `0 ${isMobile ? 12 : 24}px` }}>
            {buildings.map(b => {
              const id = b.id || b.suggestedId;
              const acc = b.accentColor || "#2D9FBF";
              return (
                <button key={id} onClick={() => setActiveId(id)} style={{
                  padding: "11px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeId === id ? acc : "transparent"}`,
                  color: activeId === id ? acc : T.navText,
                  fontSize: 13,
                  fontWeight: activeId === id ? 700 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  letterSpacing: "0.02em",
                }}>{b.suggestedName || b.name}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 14 }}>Loading buildings...</div>
        ) : buildings.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
            <div style={{ fontSize: 14, color: T.textMuted, textAlign: "center" }}>No buildings in database yet.</div>
            <button onClick={() => setShowAdd(true)} style={{ padding: "12px 24px", background: T.text, border: "none", borderRadius: 8, color: T.textInverse, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Add First Building</button>
          </div>
        ) : active ? (
          <ProjectView
            project={active}
            onEdit={() => setEditBuilding(active)}
            onDelete={() => {
              if (window.confirm("Delete " + ((active.suggestedName || active.name) + "?"))) {
                const id = active.id || active.suggestedId;
                fetch("/api/buildings?id=" + id, { method: "DELETE" });
                const next = buildings.filter(b => (b.id || b.suggestedId) !== id);
                setBuildings(next);
                setActiveId(next[0]?.id || next[0]?.suggestedId || null);
              }
            }}
          />
        ) : null}
      </div>

      {/* Footer */}
      <div style={{ background: T.footerBg, borderTop: `1px solid ${T.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 4 }}>
        <div style={{ fontSize: 11, color: T.footerText }}>Modern Living Group New Construction Tool — Internal Use Only</div>
        <div style={{ fontSize: 11, color: T.footerText }}>Prices subject to change · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
      </div>

      {/* Edit modal */}
      {editBuilding && (
        <EditModal
          building={editBuilding}
          onSave={handleEditSave}
          onClose={() => setEditBuilding(null)}
        />
      )}
    </div>
  );
}
