// src/AddProject.jsx — Add New Building wizard
import { useState, useRef } from "react";

const T = {
  bg: "#ffffff", bgAlt: "#f7f7f7", bgCard: "#f9f9f9",
  border: "#e5e5e5", borderStrong: "#d0d0d0",
  text: "#111111", textSub: "#555555", textMuted: "#999999",
  textInverse: "#ffffff",
};

const STEPS = ["Gather", "Basic Info", "Team", "Building", "Pricing", "Gallery", "Floor Plans", "Review"];

const EMPTY = {
  suggestedId: "", suggestedName: "", name: "", subtitle: "", tagline: "", accentColor: "#2D9FBF",
  status: "Pre-Construction / Sales Launched", salesLaunch: "", estimatedDelivery: "", constructionStart: "",
  constructionLoan: "", address: "", salesGallery: "", phone: "", phone2: "", email: "", website: "",
  instagram: "", developer: "", architect: "", interiorDesigner: "", landscape: "", salesBroker: "",
  management: "", contractor: "", totalUnits: "", totalFloors: "", towers: "", residencesPerFloor: "",
  siteSF: "", amenitiesSF: "", leedCertified: "", priceRange: "", priceFrom: "", unitSizeRange: "",
  bedrooms: "", views: "", parking: "", locationNote: "", keyFacts: [], amenities: [],
  renderings: [], floorPlanImages: [], floorPlans: [], brokerDocs: [],
};

function deepMerge(base, updates) {
  const out = { ...base };
  for (const [k, v] of Object.entries(updates || {})) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v) && v.length > 0) { out[k] = v; continue; }
    if (Array.isArray(v)) continue;
    if (typeof v === "object") { out[k] = { ...(base[k] || {}), ...v }; continue; }
    out[k] = v;
  }
  return out;
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
      {STEPS.map((s, i) => (
        <span key={s} style={{
          padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase",
          background: i < step ? "#111" : i === step ? "#2D9FBF" : T.bgAlt,
          color: i <= step ? "#fff" : T.textMuted,
          border: `1px solid ${i < step ? "#111" : i === step ? "#2D9FBF" : T.border}`,
        }}>{i < step ? "✓ " : ""}{s}</span>
      ))}
    </div>
  );
}

// ── Field helpers ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input type={type} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
      {hint && <div style={{ fontSize: 11, color: T.textMuted }}>{hint}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>{children}</div>;
}

function SectionHead({ label }) {
  return <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: 20, paddingBottom: 6, borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>{label}</div>;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AddProject({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [project, setProject] = useState({ ...EMPTY });

  // Gather step state
  const [siteUrl, setSiteUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [directLinks, setDirectLinks] = useState([""]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]); // [{name, buffer}]
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("");
  const [gatherResults, setGatherResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setProject(p => ({ ...p, [k]: v }));
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // ── PDF file handling ────────────────────────────────────────────────────
  async function addPdfFiles(files) {
    const newPdfs = [];
    for (const file of Array.from(files)) {
      if (!file.name.match(/\.(pdf)$/i)) continue;
      const buf = await file.arrayBuffer();
      newPdfs.push({ name: file.name, buffer: buf });
    }
    setUploadedPdfs(prev => [...prev, ...newPdfs]);
  }

  // ── Gather & Research ────────────────────────────────────────────────────
  async function handleResearch() {
    const hasAnything = siteUrl || driveUrl || uploadedPdfs.length > 0 || directLinks.some(Boolean);
    if (!hasAnything) { next(); return; }

    setProcessing(true);
    setGatherResults(null);
    let merged = { ...project };
    const log = [];

    // 1. Research site URL with Claude AI
    if (siteUrl.trim()) {
      setProcessingMsg("🔍 Researching " + siteUrl + "...");
      try {
        const r = await fetch("/api/research-building", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: siteUrl.trim() }),
        });
        const data = await r.json();
        if (data.project) {
          merged = deepMerge(merged, data.project);
          log.push("✓ Site researched — " + (data.project.suggestedName || siteUrl));
        } else if (data.error) {
          log.push("⚠ Site research: " + data.error);
        }
      } catch (e) { log.push("⚠ Site research error: " + e.message); }
    }

    // 2. Extract from uploaded PDFs
    for (const pdf of uploadedPdfs) {
      setProcessingMsg("📄 Extracting from " + pdf.name + "...");
      try {
        const r = await fetch("/api/upload-pdf", {
          method: "POST",
          headers: {
            "x-building-id": merged.suggestedId || "new",
            "x-doc-name": pdf.name.replace(/\.pdf$/i, ""),
            "x-context": "building information sheet, pricing, floor plans, fact sheet",
          },
          body: pdf.buffer,
        });
        const data = await r.json();
        if (data.extracted) {
          merged = deepMerge(merged, data.extracted);
          log.push("✓ PDF extracted: " + pdf.name);
        }
      } catch (e) { log.push("⚠ PDF error (" + pdf.name + "): " + e.message); }
    }

    // 3. Direct PDF links -- fetch and extract via upload-pdf
    const validLinks = directLinks.filter(l => l.trim().startsWith("http"));
    for (const link of validLinks) {
      const name = decodeURIComponent(link.split("/").pop().split("?")[0]) || "Document";
      const isPdf = link.toLowerCase().includes(".pdf") || link.includes("dl=1");
      if (isPdf) {
        setProcessingMsg("Extracting from " + name + "...");
        try {
          const pdfRes = await fetch(link);
          if (pdfRes.ok) {
            const buf = await pdfRes.arrayBuffer();
            const r = await fetch("/api/upload-pdf", {
              method: "POST",
              headers: {
                "x-building-id": merged.suggestedId || "new",
                "x-doc-name": name.replace(/\.pdf$/i, ""),
                "x-context": "building information sheet, pricing, floor plans, fact sheet",
              },
              body: buf,
            });
            const data = await r.json();
            if (data.extracted) { merged = deepMerge(merged, data.extracted); }
            if (!merged.brokerDocs) merged.brokerDocs = [];
            merged.brokerDocs.push({ name, url: link, pdf: link });
            log.push("✓ Link extracted: " + name);
          } else {
            if (!merged.brokerDocs) merged.brokerDocs = [];
            merged.brokerDocs.push({ name, url: link, pdf: link });
            log.push("⚠ Link saved (could not fetch): " + name);
          }
        } catch (e) {
          if (!merged.brokerDocs) merged.brokerDocs = [];
          merged.brokerDocs.push({ name, url: link, pdf: link });
          log.push("⚠ Link saved (fetch error): " + name);
        }
      } else {
        if (!merged.brokerDocs) merged.brokerDocs = [];
        merged.brokerDocs.push({ name, url: link, pdf: link });
        log.push("✓ Link added: " + name);
      }
    }

    // 4. Try Dropbox/Drive folder import
    if (driveUrl.trim()) {
      setProcessingMsg("📁 Importing from folder...");
      try {
        const r = await fetch("/api/dropbox-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderUrl: driveUrl.trim() }),
        });
        const data = await r.json();
        if (data.count > 0) {
          const imgItems = (data.images || []).map(f => ({ url: f.url, caption: f.name, category: "Exterior" }));
          const pdfItems = (data.pdfs || []).map(f => ({ name: f.name, url: f.url, pdf: f.url }));
          if (imgItems.length) merged.renderings = [...(merged.renderings || []), ...imgItems];
          if (pdfItems.length) merged.brokerDocs = [...(merged.brokerDocs || []), ...pdfItems];
          log.push("✓ Folder: " + data.count + " files imported");
        } else {
          log.push("⚠ Folder: no files found (check link is shared publicly)");
        }
      } catch (e) { log.push("⚠ Folder import error: " + e.message); }
    }

    // Ensure id is set
    if (!merged.suggestedId && merged.suggestedName) {
      merged.suggestedId = merged.suggestedName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20);
    }

    setProject(merged);
    setGatherResults(log);
    setProcessing(false);
    // Don't auto-advance so user can see results
  }

  // ── Save to KV (Stage 1) — basics + content ────────────────────────────────
  // Floor plans (Stage 2) are mirrored to Blob, thumbnails rendered, and AI
  // metadata extracted in the background after the building appears in the UI.
  // This keeps the wizard responsive — user lands in the new building immediately
  // and watches floor plan cards populate as the pipeline runs.
  const [submitState, setSubmitState] = useState(null);
  // submitState shape: null | "saving" | "processing-floorplans" | "done"
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0, name: "" });

  async function handleSubmit() {
    const bid = project.suggestedId || project.name?.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20) || "building-" + Date.now();

    // Stage 1: write building to KV with whatever we have.
    setSubmitState("saving");
    const stage1Data = { ...project, id: bid };
    try {
      await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bid, data: stage1Data }),
      });
    } catch (e) {
      console.warn("KV save:", e.message);
      setSubmitState(null);
      alert("Could not save building: " + e.message);
      return;
    }

    // Stage 2: process floor plan files. This can take a while (each plan is
    // fetch → render PNG → upload PDF → upload thumb → AI extract). We do it
    // in-place inside the wizard so the user can watch progress; on completion
    // we call onComplete with the fully-processed building so the parent app
    // refreshes with thumbnails ready.
    const fpFiles = (project.floorPlanImages || []).filter(it => it.pdf);
    if (fpFiles.length === 0) {
      onComplete({ ...stage1Data, id: bid });
      return;
    }

    setSubmitState("processing-floorplans");
    setSubmitProgress({ current: 0, total: fpFiles.length, name: "" });

    // Lazy-load the heavy libs only when the user actually saves.
    let pdfjsLib, blobClient;
    try {
      pdfjsLib = await import("https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs";
      blobClient = await import("https://esm.sh/@vercel/blob@0.27.3/client");
    } catch (e) {
      console.warn("Floor plan processor libs failed to load:", e.message);
      // Skip Stage 2 entirely; building is already saved with raw URLs.
      onComplete({ ...stage1Data, id: bid });
      return;
    }

    const processedPlans = [];
    for (let i = 0; i < fpFiles.length; i++) {
      const it = fpFiles[i];
      setSubmitProgress({ current: i + 1, total: fpFiles.length, name: it.name || ("Plan " + (i + 1)) });
      const cleanName = (it.name || ("plan-" + i)).replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 60);

      try {
        // Fetch source PDF
        const srcRes = await fetch(it.pdf);
        if (!srcRes.ok) throw new Error("source fetch " + srcRes.status);
        const buf = await srcRes.arrayBuffer();
        const isPdf = /pdf/i.test(srcRes.headers.get("content-type") || "") || /\.pdf(\?|$)/i.test(it.pdf);

        let mirroredUrl = it.pdf;
        let thumbUrl = it.thumb;

        if (isPdf) {
          // Mirror PDF to our Blob
          const pdfBlob = await blobClient.upload(
            "buildings/" + bid + "/floorplans/" + cleanName + ".pdf",
            new Blob([buf], { type: "application/pdf" }),
            {
              access: "public",
              handleUploadUrl: "/api/upload-token",
              contentType: "application/pdf",
              clientPayload: JSON.stringify({ buildingId: bid, kind: "floorplan", name: it.name }),
            }
          );
          mirroredUrl = pdfBlob.url;

          // Render page 1 → PNG → mirror to Blob
          try {
            const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            const png = await new Promise(r => canvas.toBlob(r, "image/png"));
            if (png) {
              const thumbResult = await blobClient.upload(
                "buildings/" + bid + "/floorplans/" + cleanName + "-thumb.png",
                png,
                {
                  access: "public",
                  handleUploadUrl: "/api/upload-token",
                  contentType: "image/png",
                  clientPayload: JSON.stringify({ buildingId: bid, kind: "floorplan-thumb", name: it.name }),
                }
              );
              thumbUrl = thumbResult.url;
            }
          } catch (e) {
            console.warn("Thumb render failed for", it.name, e.message);
          }

          // AI metadata extraction via /api/upload-pdf
          try {
            const aiRes = await fetch("/api/upload-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind: "floorplan",
                blobUrl: mirroredUrl,
                thumbUrl,
                buildingId: bid,
                sourceName: it.name,
              }),
            });
            // The API persists into KV directly; we just keep going.
            await aiRes.json().catch(() => null);
          } catch (e) {
            console.warn("AI extract failed for", it.name, e.message);
          }
        }

        processedPlans.push({
          name: it.name || ("Plan " + (i + 1)),
          pdf: mirroredUrl,
          thumb: thumbUrl || mirroredUrl,
          beds: null, baths: null, den: false,
          interiorSF: null, exteriorSF: null, totalSF: null,
          exposure: null, floors: null, tier: null, units: [],
        });
      } catch (e) {
        console.warn("Floor plan failed:", it.name, e.message);
        // Still push so user sees it as a card; thumb may be the original PDF URL
        processedPlans.push({
          name: it.name || ("Plan " + (i + 1)),
          pdf: it.pdf, thumb: it.thumb || it.pdf,
          beds: null, baths: null, den: false,
          interiorSF: null, exteriorSF: null, totalSF: null,
          exposure: null, floors: null, tier: null, units: [],
        });
      }
    }

    // Re-fetch building from KV — the upload-pdf calls above mutated it
    // in-place with extracted metadata (and merged into existing floorPlans
    // by name). Hand that authoritative copy to the parent.
    let finalBuilding = stage1Data;
    try {
      const r = await fetch("/api/buildings?_=" + Date.now());
      if (r.ok) {
        const all = await r.json();
        const fresh = all.find(b => (b.id || b.suggestedId) === bid);
        if (fresh) finalBuilding = fresh;
      }
    } catch (e) { /* fall back to local */ }

    setSubmitState("done");
    onComplete({ ...finalBuilding, id: bid });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 0: GATHER (unified input)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderGather = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 6, color: T.text }}>Gather Building Information</h2>
      <p style={{ fontSize: 14, color: T.textSub, marginBottom: 24, lineHeight: 1.5 }}>
        Add any combination of inputs below — Claude will use everything you provide to populate the building profile automatically.
        All fields are optional.
      </p>

      {/* 1. Website URL */}
      <div style={{ marginBottom: 16, padding: "16px 20px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🌐</span> Project Website
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Claude will scan the site for pricing, team info, images, and specs.</div>
        <input
          type="text"
          value={siteUrl}
          onChange={e => setSiteUrl(e.target.value)}
          placeholder="https://projectwebsite.com"
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: T.bg, color: T.text }}
        />
      </div>

      {/* 2. PDF Upload */}
      <div style={{ marginBottom: 16, padding: "16px 20px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span>📄</span> Upload PDFs
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Price sheets, fact sheets, floor plan PDFs — Claude will extract all structured data.</div>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addPdfFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${dragOver ? "#2D9FBF" : T.border}`,
            borderRadius: 8, padding: "20px 16px",
            textAlign: "center", cursor: "pointer",
            background: dragOver ? "#f0f9ff" : T.bg,
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 13, color: T.textSub }}>Drag &amp; drop PDFs here, or click to browse</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Price sheets, fact sheets, floor plan PDFs</div>
          <input ref={fileRef} type="file" accept=".pdf" multiple style={{ display: "none" }} onChange={e => addPdfFiles(e.target.files)} />
        </div>
        {uploadedPdfs.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {uploadedPdfs.map((pdf, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#e8f5e9", borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: "#2e7d32" }}>📄 {pdf.name}</span>
                <button onClick={() => setUploadedPdfs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Direct PDF/Doc Links */}
      <div style={{ marginBottom: 16, padding: "16px 20px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔗</span> Direct Document Links
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Paste direct URLs to PDFs or documents (e.g. from Dropbox, Box, or a CDN).</div>
        {directLinks.map((link, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={link}
              onChange={e => setDirectLinks(prev => prev.map((l, j) => j === i ? e.target.value : l))}
              placeholder="https://example.com/document.pdf"
              style={{ flex: 1, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: T.bg, color: T.text }}
            />
            {directLinks.length > 1 && (
              <button onClick={() => setDirectLinks(prev => prev.filter((_, j) => j !== i))} style={{ padding: "9px 12px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", color: T.textSub, fontSize: 16 }}>×</button>
            )}
          </div>
        ))}
        <button onClick={() => setDirectLinks(prev => [...prev, ""])} style={{ fontSize: 12, color: "#2D9FBF", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 600 }}>+ Add another link</button>
      </div>

      {/* 4. Dropbox / Google Drive folder */}
      <div style={{ marginBottom: 24, padding: "16px 20px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <span>📂</span> Dropbox or Google Drive Folder
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Paste a shared folder link to import all PDFs and images automatically.</div>
        <input
          type="text"
          value={driveUrl}
          onChange={e => setDriveUrl(e.target.value)}
          placeholder="https://www.dropbox.com/sh/... or Google Drive folder URL"
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: T.bg, color: T.text }}
        />
      </div>

      {/* Results from previous research */}
      {gatherResults && (
        <div style={{ marginBottom: 20, padding: "14px 16px", background: "#f8fff8", border: "1px solid #c8e6c9", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", marginBottom: 8 }}>Research Results</div>
          {gatherResults.map((msg, i) => (
            <div key={i} style={{ fontSize: 12, color: msg.startsWith("⚠") ? "#e65100" : "#333", marginBottom: 4 }}>{msg}</div>
          ))}
          <div style={{ marginTop: 12, fontSize: 13, color: T.textSub }}>
            Review the populated fields in the next steps. You can edit anything.
          </div>
        </div>
      )}

      {/* Processing state */}
      {processing && (
        <div style={{ marginBottom: 20, padding: "14px 16px", background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 20, height: 20, border: "2px solid #90caf9", borderTopColor: "#1565c0", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: "#1565c0" }}>{processingMsg || "Processing..."}</div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={handleResearch}
          disabled={processing}
          style={{ flex: 1, minWidth: 200, padding: "14px 24px", background: processing ? "#999" : "#111", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: processing ? "default" : "pointer", minHeight: 48 }}
        >
          {processing ? processingMsg || "Processing..." : gatherResults ? "Research Again →" : "Research with AI →"}
        </button>
        {gatherResults && (
          <button onClick={next} style={{ padding: "14px 24px", background: "#2D9FBF", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48 }}>
            Continue →
          </button>
        )}
        <button onClick={next} style={{ padding: "14px 20px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textSub, fontSize: 13, cursor: "pointer", minHeight: 48 }}>
          Skip, fill manually →
        </button>
      </div>

    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: BASIC INFO
  // ═══════════════════════════════════════════════════════════════════════════
  const renderBasicInfo = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 20, color: T.text }}>Basic Information</h2>
      <Grid>
        <Field label="Building Name *" value={project.suggestedName} onChange={v => set("suggestedName", v)} placeholder="Maison d'Or" />
        <Field label="Building ID (no spaces)" value={project.suggestedId} onChange={v => set("suggestedId", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="maisondor" hint="Used internally — lowercase, no spaces" />
        <Field label="Subtitle" value={project.subtitle} onChange={v => set("subtitle", v)} placeholder="South Flagler" />
        <Field label="Tagline" value={project.tagline} onChange={v => set("tagline", v)} placeholder="House of Gold — Ultra-Luxury Boutique Residences" />
        <Field label="Accent Color" value={project.accentColor} onChange={v => set("accentColor", v)} type="color" />
        <Select label="Status" value={project.status} onChange={v => set("status", v)} options={["Pre-Construction / Sales Launched", "Under Construction", "Completed"]} />
      </Grid>
      <SectionHead label="Timeline" />
      <Grid>
        <Field label="Sales Launch" value={project.salesLaunch} onChange={v => set("salesLaunch", v)} placeholder="January 2026" />
        <Field label="Est. Delivery" value={project.estimatedDelivery} onChange={v => set("estimatedDelivery", v)} placeholder="Q4 2027" />
        <Field label="Construction Start" value={project.constructionStart} onChange={v => set("constructionStart", v)} placeholder="April 2025" />
        <Field label="Construction Loan" value={project.constructionLoan} onChange={v => set("constructionLoan", v)} placeholder="$380M — Lender Name" />
      </Grid>
      <SectionHead label="Contact" />
      <Grid>
        <Field label="Address" value={project.address} onChange={v => set("address", v)} />
        <Field label="Sales Gallery" value={project.salesGallery} onChange={v => set("salesGallery", v)} />
        <Field label="Phone" value={project.phone} onChange={v => set("phone", v)} placeholder="561.XXX.XXXX" />
        <Field label="Phone 2" value={project.phone2} onChange={v => set("phone2", v)} />
        <Field label="Email" value={project.email} onChange={v => set("email", v)} />
        <Field label="Website" value={project.website} onChange={v => set("website", v)} placeholder="domain.com" />
        <Field label="Instagram URL" value={project.instagram} onChange={v => set("instagram", v)} />
        <Field label="Location Note" value={project.locationNote} onChange={v => set("locationNote", v)} placeholder="Across Intracoastal from Mar-a-Lago" />
      </Grid>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: TEAM
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTeam = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 20, color: T.text }}>Development Team</h2>
      <Grid>
        <Field label="Developer" value={project.developer} onChange={v => set("developer", v)} />
        <Field label="Architect" value={project.architect} onChange={v => set("architect", v)} />
        <Field label="Interior Designer" value={project.interiorDesigner} onChange={v => set("interiorDesigner", v)} />
        <Field label="Landscape" value={project.landscape} onChange={v => set("landscape", v)} />
        <Field label="Sales Broker" value={project.salesBroker} onChange={v => set("salesBroker", v)} />
        <Field label="Management" value={project.management} onChange={v => set("management", v)} />
        <Field label="Contractor" value={project.contractor} onChange={v => set("contractor", v)} />
      </Grid>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: BUILDING SPECS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderBuilding = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 20, color: T.text }}>Building Specs</h2>
      <Grid>
        <Field label="Total Units" value={project.totalUnits} onChange={v => set("totalUnits", v)} type="number" />
        <Field label="Total Floors" value={project.totalFloors} onChange={v => set("totalFloors", v)} type="number" />
        <Field label="Towers" value={project.towers} onChange={v => set("towers", v)} type="number" />
        <Field label="Residences Per Floor" value={project.residencesPerFloor} onChange={v => set("residencesPerFloor", v)} />
        <Field label="Site Area" value={project.siteSF} onChange={v => set("siteSF", v)} placeholder="4 acres" />
        <Field label="Amenity Space" value={project.amenitiesSF} onChange={v => set("amenitiesSF", v)} placeholder="50,000 SF" />
        <Field label="LEED Certification" value={project.leedCertified} onChange={v => set("leedCertified", v)} placeholder="LEED Gold" />
      </Grid>
      <SectionHead label="Pricing & Units" />
      <Grid>
        <Field label="Price Range" value={project.priceRange} onChange={v => set("priceRange", v)} placeholder="$5M – $15M+" />
        <Field label="Price From (number)" value={project.priceFrom} onChange={v => set("priceFrom", v)} type="number" />
        <Field label="Unit Size Range" value={project.unitSizeRange} onChange={v => set("unitSizeRange", v)} placeholder="1,483 – 4,110 SF interior" />
        <Field label="Bedrooms" value={project.bedrooms} onChange={v => set("bedrooms", v)} placeholder="2–4 Bedrooms" />
        <Field label="Views" value={project.views} onChange={v => set("views", v)} />
        <Field label="Parking" value={project.parking} onChange={v => set("parking", v)} />
      </Grid>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: PRICING (key facts)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPricing = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 8, color: T.text }}>Key Facts &amp; Highlights</h2>
      <p style={{ fontSize: 13, color: T.textSub, marginBottom: 20 }}>These show as bullet points on the Overview tab. Add the most compelling selling points.</p>
      {(project.keyFacts || []).map((fact, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={fact} onChange={e => set("keyFacts", project.keyFacts.map((f, j) => j === i ? e.target.value : f))}
            placeholder="Key selling point..."
            style={{ flex: 1, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: T.bg }} />
          <button onClick={() => set("keyFacts", project.keyFacts.filter((_, j) => j !== i))} style={{ padding: "9px 14px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", color: T.textSub }}>×</button>
        </div>
      ))}
      <button onClick={() => set("keyFacts", [...(project.keyFacts || []), ""])} style={{ padding: "10px 16px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", color: T.textSub, fontSize: 13 }}>+ Add Key Fact</button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: GALLERY
  // ═══════════════════════════════════════════════════════════════════════════
  const renderGallery = () => {
    const removeRendering = (idx) => {
      setProject(p => ({ ...p, renderings: (p.renderings || []).filter((_, i) => i !== idx) }));
    };
    const total = project.renderings?.length || 0;
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 8, color: T.text }}>Gallery</h2>
        <p style={{ fontSize: 13, color: T.textSub, marginBottom: 20 }}>
          {total === 0
            ? "No images loaded yet. Images are auto-pulled when you scan a site above."
            : `${total} image${total === 1 ? "" : "s"} loaded. Click ✕ to remove any image you don't want to keep.`}
        </p>
        {total > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {project.renderings.map((img, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 6, overflow: "hidden", background: T.bgAlt, border: `1px solid ${T.border}` }}>
                <img
                  src={img.url}
                  alt={img.caption || ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => e.target.style.opacity = 0}
                />
                {img.category && (
                  <div style={{ position: "absolute", bottom: 4, left: 4, padding: "2px 6px", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 10, fontWeight: 600, borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {img.category}
                  </div>
                )}
                <button
                  onClick={() => removeRendering(i)}
                  title="Remove this image"
                  style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: FLOOR PLANS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderFloorPlans = () => {
    const items = project.floorPlanImages || [];
    const removeFP = (idx) => {
      setProject(p => ({ ...p, floorPlanImages: (p.floorPlanImages || []).filter((_, i) => i !== idx) }));
    };
    const renameFP = (idx, newName) => {
      setProject(p => ({
        ...p,
        floorPlanImages: (p.floorPlanImages || []).map((it, i) => i === idx ? { ...it, name: newName } : it),
      }));
    };
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 8, color: T.text }}>Floor Plans</h2>
        <p style={{ fontSize: 13, color: T.textSub, marginBottom: 20 }}>
          {items.length === 0
            ? "No floor plan files discovered yet. The site may not list them publicly — you can upload PDFs after creating the building."
            : `${items.length} floor plan file${items.length === 1 ? "" : "s"} discovered. Edit names or remove anything that's not a floor plan. After you save, each PDF will be mirrored to your storage and a thumbnail rendered automatically.`}
        </p>
        {items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((it, i) => {
              const isImg = /\.(jpe?g|png|gif|webp)(\?|$)/i.test(it.thumb || it.pdf || "");
              return (
                <div key={i} style={{ padding: "10px 12px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: T.bgAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.textMuted }}>
                    {isImg
                      ? <img src={it.thumb || it.pdf} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.textContent = "PDF"; }} />
                      : "PDF"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      value={it.name || ""}
                      onChange={e => renameFP(i, e.target.value)}
                      placeholder="Floor plan name"
                      style={{ width: "100%", padding: "6px 8px", fontSize: 13, fontWeight: 600, color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, background: T.bg, marginBottom: 4 }}
                    />
                    <a href={it.pdf} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.textMuted, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                      {(it.pdf || "").length > 80 ? (it.pdf || "").substring(0, 80) + "…" : it.pdf}
                    </a>
                  </div>
                  <button
                    onClick={() => removeFP(i)}
                    title="Remove"
                    style={{ width: 28, height: 28, borderRadius: 4, background: T.bgAlt, color: T.textSub, border: `1px solid ${T.border}`, fontSize: 14, fontWeight: 700, lineHeight: 1, cursor: "pointer" }}
                  >×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 7: REVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const renderReview = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 8, color: T.text }}>Review &amp; Add</h2>
      <p style={{ fontSize: 13, color: T.textSub, marginBottom: 20 }}>Review the summary below, then click Add Building to save.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          ["Building", project.suggestedName || "(no name)"],
          ["Status", project.status],
          ["Developer", project.developer],
          ["Address", project.address],
          ["Price Range", project.priceRange],
          ["Units", project.totalUnits],
          ["Floors", project.totalFloors],
          ["Est. Delivery", project.estimatedDelivery],
          ["Renderings", (project.renderings?.length || 0) + " images"],
          ["Floor Plans", ((project.floorPlanImages?.length || 0) + (project.floorPlans?.length || 0)) + " files"],
          ["Amenities", (() => {
            const a = project.amenities || [];
            if (a.length === 0) return "0 items";
            // structured shape: count items across all categories
            if (typeof a[0] === "object" && a[0]?.category) {
              const totalItems = a.reduce((sum, c) => sum + (c.items?.length || 0), 0);
              return totalItems + " items in " + a.length + " categories";
            }
            return a.length + " items";
          })()],
          ["Key Facts", project.keyFacts?.length + " items"],
        ].map(([k, v]) => v && v !== "undefined items" && (
          <div key={k} style={{ padding: "10px 14px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: k === "Building" ? 700 : 400 }}>{v}</div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitState === "saving" || submitState === "processing-floorplans"}
        style={{
          width: "100%",
          padding: "16px",
          background: submitState ? "#888" : (project.accentColor || "#111"),
          border: "none",
          borderRadius: 10,
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: submitState ? "not-allowed" : "pointer",
          minHeight: 54,
          opacity: submitState ? 0.85 : 1,
        }}
      >
        {submitState === "saving" && "Saving…"}
        {submitState === "processing-floorplans" &&
          ("Processing floor plan " + submitProgress.current + " of " + submitProgress.total +
            (submitProgress.name ? " — " + submitProgress.name : "") + "…")}
        {!submitState && "✓ Add Building"}
        {submitState === "done" && "Done"}
      </button>
      {submitState === "processing-floorplans" && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: T.bgCard, borderRadius: 8, fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>
          The building is already saved. Floor plans are being mirrored to your storage, thumbnails rendered, and metadata extracted. You'll see them populate after this finishes.
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  const steps = [renderGather, renderBasicInfo, renderTeam, renderBuilding, renderPricing, renderGallery, renderFloorPlans, renderReview];

  // Inject spinner CSS once
  if (typeof document !== 'undefined' && !document.getElementById('mlg-spinner-css')) {
    const s = document.createElement('style');
    s.id = 'mlg-spinner-css';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: T.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Modern Living Group</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Add New Building</div>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 13, color: T.textMuted, cursor: "pointer", padding: "8px 12px" }}>× Cancel</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "32px 24px", boxSizing: "border-box" }}>
        <StepBar step={step} />
        {steps[step]?.()}
      </div>

      {/* Nav footer */}
      {step > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", background: T.bg }}>
          <button onClick={back} style={{ padding: "10px 20px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 14, color: T.text, fontWeight: 600 }}>← Back</button>
          {step < STEPS.length - 1 && (
            <button onClick={next} style={{ padding: "10px 24px", background: "#111", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#fff", fontWeight: 700 }}>Next →</button>
          )}
        </div>
      )}
    </div>
  );
}
