// src/app.jsx -- MLG New Construction Tool v3 (clean rebuild)
// Mobile-first, KV-backed, fully editable
import { useState, useEffect, useRef } from "react";
import AddProject from "./AddProject.jsx";

// Theme (locked)
const T = {
  bg: "#ffffff", bgAlt: "#f7f7f7", bgCard: "#f9f9f9", bgNav: "#ffffff",
  bgSection: "#f4f4f4", border: "#e5e5e5", borderStrong: "#d0d0d0",
  text: "#111111", textSub: "#555555", textMuted: "#999999",
  textInverse: "#ffffff", navText: "#333333",
  footerBg: "#f4f4f4", footerText: "#aaaaaa",
};

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

const STATUS_STYLES = {
  "Pre-Sales":                          { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
  "Pre-Construction / Sales Launched":  { bg: "#fff8e1", color: "#e65100", border: "#ffcc80" },
  "Under Construction":                 { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  "Completed":                          { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
};

function ProjectBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES["Pre-Construction / Sales Launched"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg,
      color: s.color,
      border: "1px solid " + s.border,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      padding: "3px 9px", borderRadius: 20, textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
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
  const img = images[idx];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, maxWidth: "92vw" }}>
        <img src={img.url} alt={img.caption} style={{ maxWidth: "92vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 4 }} onError={e => { e.target.alt = "Unavailable"; }} />
        <div style={{ color: "#eee", fontSize: 13, textAlign: "center" }}>
          {img.caption}
          <span style={{ color: "#aaa", marginLeft: 8 }}>{" -- "}{img.category}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === 0 ? "#555" : "#fff", padding: "0", borderRadius: 8, cursor: idx === 0 ? "default" : "pointer", fontSize: 24, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {"<"}
          </button>
          <span style={{ color: "#aaa", fontSize: 12 }}>{idx + 1} / {images.length}</span>
          <button onClick={() => setIdx(i => Math.min(i + 1, images.length - 1))} disabled={idx === images.length - 1}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: idx === images.length - 1 ? "#555" : "#fff", padding: "0", borderRadius: 8, cursor: idx === images.length - 1 ? "default" : "pointer", fontSize: 24, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {">"}
          </button>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", padding: "0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, width: 64, height: 52, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: "0.04em" }}>
            CLOSE
          </button>
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
  if (!renderings.length) return <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "40px 0" }}>No gallery images loaded yet.</div>;
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid " + (filter === c ? accent : T.border),
            background: filter === c ? accent : T.bg,
            color: filter === c ? T.textInverse : T.textSub,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {filtered.map((img, i) => {
          const globalIdx = renderings.indexOf(img);
          return (
            <div key={i} onClick={() => setModal(globalIdx)} style={{ cursor: "pointer", borderRadius: 6, overflow: "hidden", border: "1px solid " + T.border, position: "relative", aspectRatio: "4/3", background: T.bgAlt }}>
              <img src={img.url} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.65))", padding: "18px 8px 6px", fontSize: 10, color: "#fff" }}>{img.caption}</div>
            </div>
          );
        })}
      </div>
      {modal !== null && <GalleryModal images={renderings} startIndex={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function PricingTab({ buildingId, accent, floorPlans = [] }) {
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
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      if (file.name.endsWith(".pdf")) {
        const buf = await file.arrayBuffer();
        const r = await fetch("/api/upload-pdf", {
          method: "POST",
          headers: { "x-building-id": String(buildingId).replace(/[^\x20-\x7E]/g, "_"), "x-doc-name": encodeURIComponent(file.name.replace(/\.pdf$/i, "")), "x-context": "pricing sheet or availability list" },
          body: buf,
        });
        const data = await r.json();
        if (data.extracted && data.extracted.pricing && data.extracted.pricing.length) {
          const newUnits = data.extracted.pricing.map((u, i) => ({ ...u, id: u.id || (buildingId + "-" + i) }));
          const r2 = await fetch("/api/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buildingId, units: newUnits }) });
          if (r2.ok) { setUnits(newUnits); setMsg("Pricing updated -- " + newUnits.length + " units loaded from PDF"); }
        } else {
          setMsg("PDF processed but no pricing data found. Try uploading a CSV.");
        }
      } else {
        const text = await file.text();
        const lines = text.trim().split("\n").filter(Boolean);
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
        const newUnits = lines.slice(1).map((line, i) => {
          const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const u = {};
          headers.forEach((h, j) => { u[h] = vals[j] || ""; });
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
        if (r2.ok) { setUnits(newUnits); setMsg("Pricing updated -- " + newUnits.length + " units loaded from CSV"); }
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
          <div style={{ fontSize: 12, color: T.textMuted }}>Upload CSV or PDF to replace inventory</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}
            style={{ padding: "10px 16px", background: accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
            {uploading ? "Processing..." : "Upload New Pricing"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.csv,.txt" style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </div>
      {msg && <div style={{ padding: "10px 14px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6, fontSize: 13, marginBottom: 16, color: "#2e7d32" }}>{msg}</div>}
      {units.length === 0 ? (
        <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No pricing loaded. Upload a CSV or PDF pricing sheet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bgAlt }}>
                {["Unit", "Floor", "Model", "Beds", "Baths", "A/C SF", "Price"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid " + T.border, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => (
                <tr key={u.id || i} style={{ borderBottom: "1px solid " + T.border, background: i % 2 === 0 ? T.bg : T.bgAlt }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.unit || "--"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.floor || "--"}</td>
                  <td style={{ padding: "10px 12px" }}>{(() => { const fp = (floorPlans || []).find(p => p.name && (p.name === u.model || p.name === u.floorplanName)); return fp && fp.pdf ? <a href={fp.pdf} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>{u.model}</a> : (u.model || "--"); })()}</td>
                  <td style={{ padding: "10px 12px" }}>{u.beds || "--"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.baths || "--"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.sqft ? u.sqft.toLocaleString() : "--"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: accent }}>{u.price ? fmt(u.price) : "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilesAndMedia({ data, set, isMobile, accent }) {
  const buildingId = data.id || data.suggestedId;

  const sections = [
    { key: "floorPlanImages", kind: "floorplan",  label: "Floor Plans",     accept: "image/*,application/pdf", note: "PDFs or images. Each becomes a card on the Floor Plans tab." },
    { key: "renderings",      kind: "rendering",  label: "Gallery Images",  accept: "image/*",                 note: "Images shown on the Gallery tab." },
    { key: "brokerDocs",      kind: "brokerdoc",  label: "Broker Toolkit",  accept: "application/pdf",         note: "PDFs shown on the Broker Toolkit tab." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <FolderImporter buildingId={buildingId} data={data} set={set} accent={accent} />
      <PricingSection buildingId={buildingId} accent={accent} />
      {sections.map(s => (
        <FileSection
          key={s.key}
          buildingId={buildingId}
          fieldKey={s.key}
          kind={s.kind}
          label={s.label}
          accept={s.accept}
          note={s.note}
          items={data[s.key] || []}
          onChange={next => set(s.key, next)}
          isMobile={isMobile}
          accent={accent}
        />
      ))}
    </div>
  );
}

function FolderImporter({ buildingId, data, set, accent }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const isDriveUrl = u => /drive\.google\.com\/(drive\/folders|file\/d|open\?id=)/i.test(u);
  const isDropboxUrl = u => /dropbox\.com/i.test(u);

  async function handleImport() {
    if (!buildingId) { alert("Save the building first, then import."); return; }
    const trimmed = url.trim();
    if (!trimmed)  { alert("Paste a Google Drive folder URL."); return; }
    if (isDropboxUrl(trimmed)) {
      setStatus("Dropbox folders aren't supported yet — Dropbox actively blocks scraping. Move the files to a Google Drive folder for now.");
      return;
    }
    if (!isDriveUrl(trimmed)) {
      setStatus("That doesn't look like a Google Drive folder URL. Expected: https://drive.google.com/drive/folders/...");
      return;
    }

    setBusy(true);
    setStatus("Enumerating folder and classifying files… this can take a minute.");
    setResult(null);
    try {
      const r = await fetch("/api/import-from-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl: trimmed, buildingId }),
      });
      const j = await r.json();
      if (!r.ok) {
        setStatus("Import failed: " + (j.error || r.status));
        setBusy(false);
        return;
      }

      // Merge categorized files into the building record (additive, no overwrites)
      const next = { ...data };
      if (j.data?.floorPlanImages?.length)  next.floorPlanImages = [...(data.floorPlanImages || []), ...j.data.floorPlanImages];
      if (j.data?.renderings?.length)       next.renderings      = [...(data.renderings      || []), ...j.data.renderings];
      if (j.data?.brokerDocs?.length)       next.brokerDocs      = [...(data.brokerDocs      || []), ...j.data.brokerDocs];

      // Push the categorized fields back via set() so the UI reflects them and Save persists them
      if (next.floorPlanImages !== data.floorPlanImages) set("floorPlanImages", next.floorPlanImages);
      if (next.renderings      !== data.renderings)      set("renderings",      next.renderings);
      if (next.brokerDocs      !== data.brokerDocs)      set("brokerDocs",      next.brokerDocs);

      // If pricing units came back, POST them to the pricing API (doesn't go through Save)
      if (j.data?.pricingUnits?.length) {
        try {
          const existing = await fetch("/api/pricing?buildingId=" + buildingId).then(x => x.ok ? x.json() : []);
          const existingUnits = Array.isArray(existing) ? existing : (existing.units || []);
          const merged = [...existingUnits, ...j.data.pricingUnits.map((u, i) => ({ ...u, id: u.id || ("import-" + Date.now() + "-" + i) }))];
          await fetch("/api/pricing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buildingId, units: merged }),
          });
        } catch (e) { console.warn("Pricing merge failed:", e.message); }
      }

      setResult(j);
      setStatus(j.truncated
        ? "Imported " + j.processed + " of " + j.totalFound + " files (capped). Run again to pick up the rest."
        : "Imported " + j.processed + " files."
      );
      setUrl("");
    } catch (e) {
      setStatus("Import error: " + e.message);
    }
    setBusy(false);
  }

  return (
    <div style={{ background: "#f0f7fa", border: "1px solid #b8d8e3", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Auto-Import from Google Drive
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
        Paste a shared Drive folder URL. Files are auto-categorized as floor plans, renderings, broker docs, or price sheets, then uploaded. Up to 12 files per run. Folder must be shared as &ldquo;Anyone with the link.&rdquo;
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          disabled={busy}
          style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 6, border: "1px solid " + T.border, fontSize: 13, color: T.text, background: T.bg, fontFamily: "inherit" }}
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={busy || !url.trim()}
          style={{ padding: "9px 16px", background: accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: busy ? "wait" : "pointer", minHeight: 40, opacity: busy || !url.trim() ? 0.6 : 1 }}
        >
          {busy ? "Importing…" : "Import"}
        </button>
      </div>
      {status && <div style={{ fontSize: 12, color: busy ? accent : (status.startsWith("Import failed") || status.startsWith("Import error") || status.includes("aren't supported") || status.includes("doesn't look") ? "#c62828" : "#2e7d32"), marginTop: 10 }}>{status}</div>}
      {result?.categorized && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: T.textSub }}>
          <span><strong>{result.categorized.floorPlanImages}</strong> floor plans</span>
          <span><strong>{result.categorized.renderings}</strong> renderings</span>
          <span><strong>{result.categorized.brokerDocs}</strong> broker docs</span>
          <span><strong>{result.categorized.pricingUnits}</strong> pricing units</span>
          {result.errors?.length ? <span style={{ color: "#c62828" }}><strong>{result.errors.length}</strong> errors</span> : null}
        </div>
      )}
    </div>
  );
}

function PricingSection({ buildingId, accent }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [unitCount, setUnitCount] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(true);

  // Load current pricing count when this component mounts
  useEffect(() => {
    if (!buildingId) return;
    fetch("/api/pricing?buildingId=" + buildingId)
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const arr = Array.isArray(d) ? d : (d.units || []);
        setUnitCount(arr.length);
      })
      .catch(() => setUnitCount(null));
  }, [buildingId]);

  async function handleUpload(file) {
    if (!buildingId) { alert("Save the building first."); return; }
    if (!file) return;
    setBusy(true);
    setStatus("Uploading " + file.name + "…");
    try {
      // Step 1: direct browser-to-Blob upload, bypassing the 4.5MB serverless
      // body limit and avoiding the iOS Safari Headers-validation issue.
      const { upload } = await import("@vercel/blob/client");
      const safeFilename = file.name.replace(/[^a-z0-9._-]/gi, "_");
      const blobPath = "buildings/" + buildingId + "/pricing/" + safeFilename;
      const blob = await upload(blobPath, file, {
        access: "public",
        contentType: "application/pdf",
        handleUploadUrl: "/api/upload-token",
        clientPayload: JSON.stringify({ buildingId, kind: "pricing", originalName: file.name }),
      });

      // Step 2: ask the server to extract pricing from that blob URL.
      // The PDF bytes never go through the function — only the URL is sent.
      setStatus("Extracting pricing rows from " + file.name + "…");
      const r = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl:    blob.url,
          buildingId,
          docName:    file.name.replace(/\.pdf$/i, ""),
          context:    "pricing sheet or availability list",
        }),
      });
      const j = await r.json();
      if (!r.ok) { setStatus("Extraction failed: " + (j.error || r.status)); setBusy(false); return; }

      const newUnits = (j.extracted?.pricing || []).map((u, i) => ({ ...u, id: u.id || ("upload-" + Date.now() + "-" + i) }));
      if (!newUnits.length) {
        setStatus("PDF saved but no pricing was detected. You can edit pricing manually on the Pricing tab.");
        setBusy(false);
        return;
      }

      // Build the units list to save:
      //  - replaceExisting: just the new units (treat the PDF as a full snapshot)
      //  - !replaceExisting: existing + new, but dedupe by unit number
      //    so re-uploading the same sheet does NOT double up
      let unitsToSave;
      if (replaceExisting) {
        unitsToSave = newUnits;
      } else {
        const existing = await fetch("/api/pricing?buildingId=" + buildingId).then(x => x.ok ? x.json() : []);
        const existingUnits = Array.isArray(existing) ? existing : (existing.units || []);
        const newKeys = new Set(newUnits.map(u => String(u.unit)));
        const kept    = existingUnits.filter(u => !newKeys.has(String(u.unit)));
        unitsToSave   = [...kept, ...newUnits];
      }

      const post = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId, units: unitsToSave }),
      });
      if (!post.ok) { setStatus("Pricing extracted but save failed."); setBusy(false); return; }

      setUnitCount(unitsToSave.length);
      setStatus(replaceExisting
        ? "Replaced pricing with " + newUnits.length + " unit" + (newUnits.length === 1 ? "" : "s") + " from " + file.name + "."
        : "Added " + newUnits.length + " unit" + (newUnits.length === 1 ? "" : "s") + " (existing pricing for those unit numbers was overwritten)."
      );
    } catch (e) {
      console.error("[Pricing] Upload failed", { name: file.name, type: file.type, size: file.size, errName: e.name, errMsg: e.message });
      setStatus("Upload error: " + e.message + " (" + (e.name || "Error") + ")");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ background: T.bgAlt, border: "1px solid " + T.border, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Pricing Sheet {unitCount !== null && <span style={{ color: T.textMuted, fontWeight: 600 }}>({unitCount} units)</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => handleUpload(e.target.files[0])} />
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            disabled={busy}
            style={{ padding: "7px 12px", background: accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer", minHeight: 34 }}
          >
            {busy ? "Processing…" : "+ Upload Price Sheet"}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.textMuted }}>PDF only. Pricing rows are extracted by AI and added to the Pricing tab.</div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 11, color: T.text, cursor: "pointer", userSelect: "none" }}>
        <input
          type="checkbox"
          checked={replaceExisting}
          onChange={e => setReplaceExisting(e.target.checked)}
          disabled={busy}
          style={{ margin: 0, accentColor: accent }}
        />
        <span><strong>Replace existing pricing</strong> {unitCount > 0 && <span style={{ color: T.textMuted }}>(deletes the current {unitCount} units, then adds the new ones)</span>}</span>
      </label>
      {status && <div style={{ fontSize: 11, color: busy ? accent : (status.includes("failed") || status.includes("error") ? "#c62828" : "#2e7d32"), marginTop: 8 }}>{status}</div>}
    </div>
  );
}

function FileSection({ buildingId, fieldKey, kind, label, accept, note, items, onChange, isMobile, accent }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const isPDF = url => /\.pdf(\?|$)/i.test(url || "");

  // Upload one or more files. Patches the matching field on the building.
  async function handleUpload(files) {
    if (!buildingId) { alert("Save the building first, then upload files."); return; }
    if (!files || !files.length) return;
    setBusy(true);

    // Lazy-load the client SDK so it doesn't bloat the initial bundle
    const { upload } = await import("@vercel/blob/client");

    const folderMap = { floorplan: "floorplans", rendering: "renderings", brokerdoc: "pdfs" };
    const subfolder = folderMap[kind] || "other";

    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress("Uploading " + (i + 1) + " of " + files.length + ": " + file.name);

      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const inferType =
        ext === "pdf"  ? "application/pdf"  :
        ext === "jpg"  ? "image/jpeg"       :
        ext === "jpeg" ? "image/jpeg"       :
        ext === "png"  ? "image/png"        :
        ext === "webp" ? "image/webp"       :
        ext === "gif"  ? "image/gif"        :
        "application/octet-stream";

      const safeFilename = file.name.replace(/[^a-z0-9._-]/gi, "_");
      const blobPath = "buildings/" + buildingId + "/" + subfolder + "/" + safeFilename;

      try {
        const blob = await upload(blobPath, file, {
          access: "public",
          contentType: inferType,
          handleUploadUrl: "/api/upload-token",
          clientPayload: JSON.stringify({ buildingId, kind, originalName: file.name }),
        });

        const baseName = file.name.replace(/\.[^.]+$/, "");
        let entry;
        if (fieldKey === "floorPlanImages") {
          entry = { name: baseName, thumb: blob.url, pdf: blob.url };
        } else if (fieldKey === "renderings") {
          entry = { url: blob.url, caption: baseName, category: "Uploaded" };
        } else if (fieldKey === "brokerDocs") {
          entry = { name: baseName, type: "document", url: blob.url };
        }
        uploaded.push(entry);
      } catch (e) {
        console.error("[Upload] Failed", { name: file.name, type: file.type, size: file.size, errName: e.name, errMsg: e.message });
        alert("Upload error for " + file.name + ": " + e.message + " (" + (e.name || "Error") + ")");
      }
    }

    if (uploaded.length) onChange([...items, ...uploaded]);
    setBusy(false);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDelete(idx) {
    const next = items.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function handleRename(idx, newName) {
    const next = items.slice();
    const item = { ...next[idx] };
    if (fieldKey === "renderings")           item.caption = newName;
    else                                     item.name    = newName;
    next[idx] = item;
    onChange(next);
  }

  // Display-friendly fields for each item shape
  function getDisplay(it) {
    if (fieldKey === "renderings")        return { label: it.caption || "image", url: it.url, isImage: true };
    if (fieldKey === "brokerDocs")        return { label: it.name || "document", url: it.url || it.pdf, isImage: false };
    /* floorPlanImages */                 return { label: it.name || "plan",     url: it.pdf || it.thumb, isImage: !isPDF(it.thumb) && !isPDF(it.pdf) };
  }

  return (
    <div style={{ background: T.bgAlt, border: "1px solid " + T.border, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label} <span style={{ color: T.textMuted, fontWeight: 600 }}>({items.length})</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={fileRef} type="file" multiple accept={accept} style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            disabled={busy}
            style={{ padding: "7px 12px", background: accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer", minHeight: 34 }}
          >
            {busy ? "Uploading..." : "+ Upload"}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>{note}</div>
      {progress && <div style={{ fontSize: 11, color: accent, marginBottom: 8 }}>{progress}</div>}

      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic", padding: "10px 0" }}>None uploaded yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((it, i) => {
            const d = getDisplay(it);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.bg, border: "1px solid " + T.border, borderRadius: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 4, background: T.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", fontSize: 11, fontWeight: 700, color: T.textMuted }}>
                  {d.isImage && d.url
                    ? <img src={d.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : "PDF"}
                </div>
                <input
                  type="text"
                  value={d.label}
                  onChange={e => handleRename(i, e.target.value)}
                  style={{ flex: 1, padding: "6px 8px", border: "1px solid " + T.border, borderRadius: 4, fontSize: 12, color: T.text, background: T.bg, fontFamily: "inherit", minWidth: 0 }}
                />
                {d.url && (
                  <a href={d.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: accent, fontWeight: 600, textDecoration: "none", padding: "4px 8px", flexShrink: 0 }}>View</a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  style={{ background: "none", border: "none", color: "#c62828", fontSize: 16, cursor: "pointer", padding: "4px 8px", fontWeight: 700, flexShrink: 0 }}
                  title="Remove"
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditModal({ building, onSave, onClose }) {
  const [data, setData] = useState({ ...building, suggestedName: building.suggestedName || building.name || "" });
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

  const FI = ({ label, k, placeholder, type }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input
        type={type || "text"}
        value={data[k] || ""}
        placeholder={placeholder || ""}
        onChange={e => set(k, e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: "1px solid " + T.border, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit" }}
      />
    </div>
  );

  const SI = ({ label, k, options }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <select value={data[k] || ""} onChange={e => set(k, e.target.value)} style={{ padding: "9px 12px", borderRadius: 6, border: "1px solid " + T.border, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const SH = ({ label }) => (
    <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: 16, paddingBottom: 4, borderBottom: "1px solid " + T.border, marginBottom: 4 }}>{label}</div>
  );

  const Grid = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>{children}</div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: T.bg, width: isMobile ? "100%" : 620, maxHeight: isMobile ? "92vh" : "88vh", borderRadius: isMobile ? "16px 16px 0 0" : 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Edit: {data.suggestedName || data.name || "Building"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textMuted, padding: "4px 8px" }}>X</button>
        </div>
        <div style={{ overflowY: "auto", padding: 20, flex: 1 }}>
          <SH label="Identity" />
          <Grid>
            <FI label="Building Name" k="suggestedName" />
            <FI label="Subtitle" k="subtitle" placeholder="e.g. South Flagler" />
            <FI label="Tagline" k="tagline" />
            <FI label="Accent Color" k="accentColor" type="color" />
          </Grid>
          <SH label="Status and Timeline" />
          <Grid>
            <SI label="Status" k="status" options={["Pre-Sales", "Pre-Construction / Sales Launched", "Under Construction", "Completed"]} />
            <FI label="Sales Launch" k="salesLaunch" placeholder="January 2024" />
            <FI label="Est. Delivery" k="estimatedDelivery" placeholder="Q4 2027" />
            <FI label="Construction Start" k="constructionStart" placeholder="April 2024" />
            <FI label="Construction Loan" k="constructionLoan" placeholder="$380M -- Lender" />
          </Grid>
          <SH label="Contact" />
          <Grid>
            <FI label="Address" k="address" />
            <FI label="Sales Gallery" k="salesGallery" />
            <FI label="Phone" k="phone" placeholder="561.XXX.XXXX" />
            <FI label="Phone 2" k="phone2" />
            <FI label="Email" k="email" />
            <FI label="Website" k="website" placeholder="domain.com" />
            <FI label="Instagram URL" k="instagram" />
          </Grid>
          <SH label="Team" />
          <Grid>
            <FI label="Developer" k="developer" />
            <FI label="Architect" k="architect" />
            <FI label="Interior Designer" k="interiorDesigner" />
            <FI label="Landscape" k="landscape" />
            <FI label="Sales Broker" k="salesBroker" />
            <FI label="Management" k="management" />
            <FI label="Contractor" k="contractor" />
          </Grid>
          <SH label="Building Specs" />
          <Grid>
            <FI label="Total Units" k="totalUnits" type="number" />
            <FI label="Total Floors" k="totalFloors" type="number" />
            <FI label="Towers" k="towers" type="number" />
            <FI label="Residences Per Floor" k="residencesPerFloor" />
            <FI label="Site Area" k="siteSF" placeholder="e.g. 4 acres" />
            <FI label="Amenity Space" k="amenitiesSF" placeholder="e.g. 50,000 SF" />
            <FI label="LEED Certification" k="leedCertified" placeholder="LEED Gold" />
          </Grid>
          <SH label="Pricing and Units" />
          <Grid>
            <FI label="Price Range" k="priceRange" placeholder="$5M to $15M+" />
            <FI label="Price From (number)" k="priceFrom" type="number" />
            <FI label="Unit Size Range" k="unitSizeRange" placeholder="1,483 to 4,110 SF" />
            <FI label="Bedrooms" k="bedrooms" placeholder="2 to 4 Bedrooms" />
            <FI label="Views" k="views" />
            <FI label="Parking" k="parking" />
          </Grid>
          <SH label="Location" />
          <Grid>
            <FI label="Location Note" k="locationNote" />
          </Grid>

          <SH label="Files and Media" />
          <FilesAndMedia data={data} set={set} isMobile={isMobile} accent={data.accentColor || "#2a2a2a"} />
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid " + T.border, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: T.bgAlt, border: "1px solid " + T.border, borderRadius: 8, fontSize: 14, cursor: "pointer", color: T.text, fontWeight: 600, minHeight: 44 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", background: data.accentColor || "#2a2a2a", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 700, minHeight: 44 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────
// Phase C/D: unified rendering components for floor plans
// and amenities. Each accepts the canonical KV schema set
// up by the Phase A migration.
// ──────────────────────────────────────────────────────────

function FloorPlanCard({ plan, accent, T }) {
  const matchingUnits = Array.isArray(plan.units) ? plan.units : [];
  const interior = plan.interiorSF ?? plan.sqft ?? null;
  const exterior = plan.exteriorSF ?? plan.terraceSF ?? null;
  const total    = plan.totalSF ?? (interior != null && exterior != null ? interior + exterior : null);

  return (
    <div style={{ background: T.bgCard, border: "1px solid " + T.border, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "4 / 3", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {plan.thumb ? (
          <img src={plan.thumb} alt={plan.name || "Floor plan"} style={{ width: "100%", height: "100%", objectFit: "contain", background: "white" }} />
        ) : plan.pdf ? (
          <a href={plan.pdf} target="_blank" rel="noreferrer" style={{ color: accent, fontSize: 13, textDecoration: "none", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📄</div>
            <div>View floor plan PDF</div>
          </a>
        ) : (
          <div style={{ color: T.textMuted, fontSize: 12 }}>No image yet</div>
        )}
      </div>
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>
          {plan.pdf ? (
            <a href={plan.pdf} target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>{plan.name || "—"}</a>
          ) : (plan.name || "—")}
        </div>
        {(plan.beds != null || plan.baths != null) && (
          <div style={{ fontSize: 12, color: T.textSub }}>
            {plan.beds != null ? plan.beds + " BR" : ""}
            {plan.den ? " + Den" : ""}
            {plan.beds != null && plan.baths != null ? "  ·  " : ""}
            {plan.baths != null ? plan.baths + " BA" : ""}
          </div>
        )}
        {(interior != null || exterior != null || total != null) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 4, fontSize: 12, color: T.textSub }}>
            <div>
              <div style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>A/C</div>
              <div style={{ fontWeight: 500 }}>{interior ? interior.toLocaleString() : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Terr.</div>
              <div style={{ fontWeight: 500 }}>{exterior ? exterior.toLocaleString() : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Total</div>
              <div style={{ fontWeight: 500 }}>{total ? total.toLocaleString() : "—"}</div>
            </div>
          </div>
        )}
        {plan.priceFrom != null && (
          <div style={{ fontSize: 13, marginTop: 4 }}>
            <span style={{ color: T.textMuted }}>From </span>
            <span style={{ color: accent, fontWeight: 600 }}>
              {plan.priceFrom >= 1000000
                ? "$" + (plan.priceFrom / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M"
                : "$" + plan.priceFrom.toLocaleString()}
            </span>
          </div>
        )}
        {(plan.floors || plan.exposure) && (
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
            {[plan.floors, plan.exposure].filter(Boolean).join("  ·  ")}
          </div>
        )}
        {matchingUnits.length > 0 && (
          <div style={{ fontSize: 11, color: T.textSub, marginTop: 6, paddingTop: 6, borderTop: "1px dashed " + T.border }}>
            <span style={{ color: T.textMuted }}>Units: </span>
            {matchingUnits.slice(0, 8).join(", ")}
            {matchingUnits.length > 8 ? "…" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function FloorPlansTab({ plans = [], accent, T, buildingId }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const inputRef = useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setStatus("Processing " + files.length + " file(s)…");

    try {
      const { upload }       = await import("https://esm.sh/@vercel/blob@0.27.3/client");
      const { PDFDocument }  = await import("https://esm.sh/pdf-lib@1.17.1");
      const pdfjsLib         = await import("https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs";

      let okCount = 0, errCount = 0;
      for (const file of files) {
        try {
          // 1. Strip disclaimer page if multi-page (last page is the floor plan in our brokers' PDFs)
          const buf = await file.arrayBuffer();
          let cleanBytes = new Uint8Array(buf);
          if (file.type === "application/pdf") {
            const doc = await PDFDocument.load(buf);
            if (doc.getPageCount() > 1) {
              const stripped = await PDFDocument.create();
              const [last] = await stripped.copyPages(doc, [doc.getPageCount() - 1]);
              stripped.addPage(last);
              cleanBytes = await stripped.save();
            }
          }

          // 2. Render page 1 of the cleaned PDF to a PNG thumbnail
          let thumbBlob = null;
          try {
            setStatus("Generating thumbnail for " + file.name + "…");
            const pdf = await pdfjsLib.getDocument({ data: cleanBytes.slice() }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            thumbBlob = await new Promise(r => canvas.toBlob(r, "image/png"));
          } catch (err) {
            console.warn("Thumbnail generation failed for", file.name, err);
          }

          const cleanName = file.name.replace(/\.[a-z]+$/i, "").replace(/[^a-zA-Z0-9-_]/g, "-");

          // 3. Upload the cleaned PDF
          setStatus("Uploading " + file.name + "…");
          const pdfPath = "buildings/" + buildingId + "/floorplans/" + cleanName + ".pdf";
          const pdfBlob = await upload(pdfPath, new Blob([cleanBytes], { type: "application/pdf" }), {
            access: "public",
            handleUploadUrl: "/api/upload-token",
            contentType: "application/pdf",
            clientPayload: JSON.stringify({ buildingId, kind: "floorplan", name: file.name }),
          });

          // 4. Upload the PNG thumbnail (if generated)
          let thumbUrl = null;
          if (thumbBlob) {
            const thumbPath = "buildings/" + buildingId + "/floorplans/" + cleanName + "-thumb.png";
            const thumbRes = await upload(thumbPath, thumbBlob, {
              access: "public",
              handleUploadUrl: "/api/upload-token",
              contentType: "image/png",
              clientPayload: JSON.stringify({ buildingId, kind: "floorplan-thumb", name: file.name }),
            });
            thumbUrl = thumbRes.url;
          }

          // 5. Server-side AI extraction + KV merge
          setStatus("Extracting metadata from " + file.name + "…");
          const r = await fetch("/api/upload-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "floorplan", blobUrl: pdfBlob.url, thumbUrl, buildingId, sourceName: file.name }),
          });
          if (!r.ok) throw new Error("Extraction failed: " + r.status);
          okCount++;
        } catch (err) {
          errCount++;
          console.error("Floor plan upload failed for", file.name, err);
        }
      }
      setStatus("Done — " + okCount + " ok" + (errCount ? ", " + errCount + " failed" : ""));
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const empty = !plans || plans.length === 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.textSub }}>
          {empty ? "No floor plans loaded yet." : plans.length + " floor plan" + (plans.length === 1 ? "" : "s")}
        </div>
        <div>
          <input ref={inputRef} type="file" accept="application/pdf" multiple onChange={handleFiles} style={{ display: "none" }} disabled={uploading} />
          <button onClick={() => inputRef.current && inputRef.current.click()} disabled={uploading} style={{ padding: "6px 12px", fontSize: 12, background: accent, color: "white", border: 0, borderRadius: 6, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.6 : 1 }}>
            {uploading ? "Working…" : "Upload PDFs"}
          </button>
        </div>
      </div>
      {status && (
        <div style={{ fontSize: 12, color: T.textSub, marginBottom: 12, padding: "8px 12px", background: T.bgCard, border: "1px solid " + T.border, borderRadius: 6 }}>{status}</div>
      )}
      {empty ? (
        <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>
          Drop PDFs above to add floor plans. The system will strip the disclaimer page, host the file, and extract beds/baths/sq footage automatically.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {plans.map((plan, i) => (
            <FloorPlanCard key={i} plan={plan} accent={accent} T={T} />
          ))}
        </div>
      )}
    </div>
  );
}

function AmenitiesTab({ amenities = [], accent, T }) {
  if (!amenities || amenities.length === 0) {
    return (
      <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>
        No amenities listed yet.
      </div>
    );
  }
  // Normalize: handle both flat string array and {category, icon, items} shape
  const groups = (typeof amenities[0] === "string")
    ? [{ category: "Amenities", icon: "✦", items: amenities }]
    : amenities.map(a => ({ category: a.category || "Amenities", icon: a.icon || "✦", items: a.items || [] }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
      {groups.map((g, i) => (
        <div key={i} style={{ background: T.bgCard, border: "1px solid " + T.border, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span style={{ fontSize: 16 }}>{g.icon}</span>
            <span>{g.category}</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {g.items.map((item, j) => (
              <li key={j} style={{ fontSize: 13, color: T.textSub, display: "flex", gap: 8, lineHeight: 1.45 }}>
                <span style={{ color: accent, flexShrink: 0, fontWeight: 600 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


function ProjectView({ project, onEdit }) {
  const TABS = ["Overview", "Floor Plans", "Amenities", "Gallery", "Pricing", "Broker Toolkit"];
  const [tab, setTab] = useState("Overview");
  const isMobile = useIsMobile();
  const accent = project.accentColor || "#2D9FBF";

  const Detail = ({ label, value }) => {
    if (!value) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "10px 0", borderBottom: "1px solid " + T.border }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 14, color: T.text }}>{value}</div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ padding: isMobile ? "16px 16px 0" : "24px 32px 0", background: T.bg }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column-reverse" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", gap: isMobile ? 6 : 12, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: accent, marginBottom: 4 }}>{project.subtitle}</div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 300, color: T.text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{project.suggestedName || project.name}</h1>
            {project.tagline && <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{project.tagline}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "center" : "flex-end", gap: 8, flexShrink: 0 }}>
            <ProjectBadge status={project.status || "Pre-Construction / Sales Launched"} />
            <button onClick={onEdit} style={{ padding: "8px 14px", background: T.bgAlt, border: "1px solid " + T.border, borderRadius: 6, fontSize: 12, cursor: "pointer", color: T.textSub, fontWeight: 600, minHeight: 36 }}>Edit</button>
          </div>
        </div>
        {project.priceRange && (
          <div style={{ marginTop: 8, marginBottom: 4 }}>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>{project.priceRange}</div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Starting price range</div>
          </div>
        )}
        {(() => {
          const stats = [
            ["Units",         project.totalUnits],
            ["Floors",        project.totalFloors],
            ["Bedrooms",      project.bedrooms],
            ["Developer",     project.developer],
            ["Architect",     project.architect],
            ["Est. Delivery", project.estimatedDelivery || "TBD"],
          ].filter(([, v]) => v);
          if (!stats.length) return null;
          return isMobile ? (
            <div style={{
              marginTop: 12,
              border: "1px solid " + T.border,
              borderRadius: 8,
              overflow: "hidden",
              background: T.bg,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
            }}>
              {stats.slice(0, 6).map(([k, v], i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                return (
                  <div key={k} style={{
                    padding: "9px 10px",
                    borderRight: col < 2 ? "1px solid " + T.border : "none",
                    borderTop:   row > 0 ? "1px solid " + T.border : "none",
                    minWidth: 0,
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: T.textMuted,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      marginBottom: 3, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>{k}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 500, color: T.text,
                      lineHeight: 1.3, wordBreak: "break-word",
                    }}>{String(v)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: "flex",
              gap: 0,
              marginTop: 12,
              border: "1px solid " + T.border,
              borderRadius: 8,
              overflow: "hidden",
              background: T.bg,
            }}>
              {stats.map(([k, v], i) => (
                <div key={k} style={{
                  padding: "10px 16px",
                  borderRight: i < stats.length - 1 ? "1px solid " + T.border : "none",
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{String(v)}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div style={{ borderBottom: "1px solid " + T.border, background: T.bg, overflowX: isMobile ? "visible" : "auto", scrollbarWidth: "none" }}>
        <div style={{
          display: "flex",
          flexWrap: isMobile ? "wrap" : "nowrap",
          minWidth: isMobile ? "auto" : "max-content",
          padding: "0 " + (isMobile ? "8" : "32") + "px",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: isMobile ? "1 1 33.33%" : "0 0 auto",
              padding: isMobile ? "11px 6px" : "12px 14px",
              background: "none", border: "none",
              borderBottom: "2px solid " + (tab === t ? accent : "transparent"),
              color: tab === t ? accent : T.textSub,
              fontSize: isMobile ? 12 : 13, fontWeight: tab === t ? 700 : 400,
              cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}>
              {t}
              {t === "Gallery" && project.renderings && project.renderings.length ? " (" + project.renderings.length + ")" : ""}
              {t === "Floor Plans" && project.floorPlanImages && project.floorPlanImages.length ? " (" + project.floorPlanImages.length + ")" : ""}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: isMobile ? "16px" : "28px 32px", minHeight: 300 }}>

        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 40 }}>
            <div>
              {project.keyFacts && project.keyFacts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Key Highlights</div>
                  {project.keyFacts.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", marginBottom: 6, background: T.bgCard, borderRadius: 8, border: "1px solid " + T.border, alignItems: "flex-start" }}>
                      <span style={{ color: accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>+</span>
                      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              {(project.phone || project.email || project.website) && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Contact</div>
                  {project.phone && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>{project.phone}</div>}
                  {project.phone2 && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>{project.phone2}</div>}
                  {project.email && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>{project.email}</div>}
                  {project.website && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>{project.website}</div>}
                  {project.salesGallery && <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>Sales Gallery: {project.salesGallery}</div>}
                  {project.instagram && <a href={project.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: accent, textDecoration: "none" }}>Instagram</a>}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Floor Plans" && (
          <FloorPlansTab plans={project.floorPlans || []} accent={accent} T={T} buildingId={project.id || project.suggestedId} />
        )}

        {tab === "Amenities" && (
          <AmenitiesTab amenities={project.amenities || []} accent={accent} T={T} />
        )}

        {tab === "Gallery" && (
          <RenderingGallery renderings={project.renderings || []} accent={accent} />
        )}

        {tab === "Pricing" && (
          <PricingTab buildingId={project.id || project.suggestedId} accent={accent} floorPlans={project.floorPlans || []} />
        )}

        {tab === "Broker Toolkit" && (
          <div>
            {(!project.brokerDocs || project.brokerDocs.length === 0) ? (
              <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 14, padding: "32px 0", textAlign: "center" }}>No broker documents loaded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.brokerDocs.map((doc, i) => (
                  <a key={i} href={doc.pdf || doc.url} target="_blank" rel="noreferrer" style={{ padding: "14px 18px", background: T.bgCard, border: "1px solid " + T.border, borderRadius: 8, textDecoration: "none", display: "flex", alignItems: "center", gap: 12, minHeight: 64 }}>
                    <span style={{ fontSize: 20 }}>PDF</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, textTransform: "capitalize" }}>{doc.type}</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: accent, fontSize: 12, fontWeight: 600 }}>Open</span>
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

function BuildingDropdown({ buildings, activeId, setActiveId }) {
  const [open, setOpen] = useState(false);
  const active = buildings.find(b => (b.id || b.suggestedId) === activeId) || buildings[0];
  const accent = active?.accentColor || "#2D9FBF";

  function pick(id) {
    setActiveId(id);
    setOpen(false);
  }

  return (
    <>
      <div style={{ background: T.bgNav, borderBottom: "1px solid " + T.border, flexShrink: 0 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            padding: "13px 16px",
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {active?.suggestedName || active?.name || "Select building"}
            </span>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, flexShrink: 0 }}>
              {buildings.length} total
            </span>
          </div>
          <span style={{ color: T.textMuted, fontSize: 13, marginLeft: 8, flexShrink: 0 }}>▼</span>
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              background: T.bg,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              maxHeight: "75vh",
              overflowY: "auto",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Select Building
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: T.textSub, fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "8px 0" }}>
              {buildings.map(b => {
                const id = b.id || b.suggestedId;
                const acc = b.accentColor || "#2D9FBF";
                const isActive = activeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => pick(id)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: isActive ? T.bgAlt : "none",
                      border: "none",
                      borderLeft: "3px solid " + (isActive ? acc : "transparent"),
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: acc, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.suggestedName || b.name}
                      </div>
                      {b.subtitle && (
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {b.subtitle}
                        </div>
                      )}
                    </div>
                    {isActive && <span style={{ color: acc, fontSize: 16, flexShrink: 0 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ height: "env(safe-area-inset-bottom, 0)" }} />
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const isMobile = useIsMobile();

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
    } catch (e) { console.warn("KV load:", e.message); }
    try {
      const { default: staticData } = await import("./data/index.js");
      const arr = Object.values(staticData);
      if (arr.length > 0) {
        setBuildings(arr.map(b => ({ ...b, id: b.id || b.suggestedId })));
        setActiveId(arr[0].id || arr[0].suggestedId);
      }
    } catch (e) { console.warn("Static load:", e.message); }
    setLoading(false);
  }

  useEffect(() => { loadBuildings(); }, []);

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
      alert("Migrated " + buildings.length + " buildings to database.");
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

  if (showAdd) return <AddProject onComplete={handleBuildingAdded} onCancel={() => setShowAdd(false)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, fontFamily: "inherit", overflow: "hidden" }}>
      <div style={{ background: T.bgNav, borderBottom: "1px solid " + T.border, padding: isMobile ? "0 12px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, minHeight: 52 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Modern Living Group</div>
          <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>New Construction Tool</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {buildings.length > 0 && !loading && (
            <button onClick={migrateToKV} disabled={migrating} title="Sync to database" style={{ padding: "7px 10px", background: T.bgAlt, border: "1px solid " + T.border, borderRadius: 6, fontSize: 11, cursor: "pointer", color: T.textSub, display: isMobile ? "none" : "block" }}>
              {migrating ? "Syncing..." : "Sync DB"}
            </button>
          )}
          <button onClick={() => setShowAdd(true)} style={{ padding: "8px 14px", background: T.text, border: "none", borderRadius: 6, color: T.textInverse, fontSize: 13, fontWeight: 700, cursor: "pointer", minHeight: 36, whiteSpace: "nowrap" }}>+ Add</button>
        </div>
      </div>

      {buildings.length > 0 && (
        isMobile ? (
          <BuildingDropdown buildings={buildings} activeId={activeId} setActiveId={setActiveId} />
        ) : (
          <div style={{ background: T.bgNav, borderBottom: "1px solid " + T.border, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", minWidth: "max-content", padding: "0 24px" }}>
              {buildings.map(b => {
                const id = b.id || b.suggestedId;
                const acc = b.accentColor || "#2D9FBF";
                return (
                  <button key={id} onClick={() => setActiveId(id)} style={{
                    padding: "11px 16px", background: "none", border: "none",
                    borderBottom: "2px solid " + (activeId === id ? acc : "transparent"),
                    color: activeId === id ? acc : T.navText,
                    fontSize: 13, fontWeight: activeId === id ? 700 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.02em",
                  }}>{b.suggestedName || b.name}</button>
                );
              })}
            </div>
          </div>
        )
      )}

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 14 }}>Loading buildings...</div>
        ) : buildings.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
            <div style={{ fontSize: 14, color: T.textMuted, textAlign: "center" }}>No buildings in database yet.</div>
            <button onClick={() => setShowAdd(true)} style={{ padding: "12px 24px", background: T.text, border: "none", borderRadius: 8, color: T.textInverse, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Add First Building</button>
          </div>
        ) : active ? (
          <ProjectView project={active} onEdit={() => setEditBuilding(active)} />
        ) : null}
      </div>

      <div style={{ background: T.footerBg, borderTop: "1px solid " + T.border, padding: "10px 20px", display: "flex", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 4 }}>
        <div style={{ fontSize: 11, color: T.footerText }}>Modern Living Group New Construction Tool -- Internal Use Only</div>
        <div style={{ fontSize: 11, color: T.footerText }}>Prices subject to change</div>
      </div>

      {editBuilding && (
        <EditModal building={editBuilding} onSave={handleEditSave} onClose={() => setEditBuilding(null)} />
      )}
    </div>
  );
}
