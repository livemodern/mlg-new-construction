// api/dropbox-import.js -- fetch()-based, with Google Drive subfolder recursion
export const maxDuration = 120;

const FETCH_OPTS = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  signal: AbortSignal.timeout(12000),
};

// -- Dropbox --
function parseDropbox(html, folderUrl) {
  const files = [];
  const base = folderUrl.split('?')[0];
  // Pattern 1: embedded filename JSON
  for (const m of html.matchAll(/"filename"\s*:\s*"([^"]+\.(?:pdf|jpg|jpeg|png|webp))"/gi)) {
    const name = m[1];
    const ext = name.split('.').pop().toLowerCase();
    files.push({ name, url: base + '/' + encodeURIComponent(name) + '?dl=1', type: ext === 'pdf' ? 'pdf' : 'image' });
  }
  // Pattern 2: href links
  if (!files.length) {
    for (const m of html.matchAll(/href="(https:\/\/www\.dropbox\.com\/[^"]+\.(?:pdf|jpg|jpeg|png|webp)[^"]*?)"/gi)) {
      const raw = m[1].replace(/\?.*$/, '') + '?dl=1';
      const name = decodeURIComponent(raw.split('/').pop().split('?')[0]);
      const ext = name.split('.').pop().toLowerCase();
      files.push({ name, url: raw, type: ext === 'pdf' ? 'pdf' : 'image' });
    }
  }
  return [...new Map(files.map(f => [f.name, f])).values()];
}

// -- Google Drive --
function getDriveFolderId(url) {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : null;
}

function extractFromDriveHtml(html, currentFolderId) {
  const files = new Map();
  const folderIds = new Set();

  // File pattern: long ID followed by filename with extension
  for (const m of html.matchAll(/"([0-9A-Za-z_-]{25,})"[^"]{0,60}"([^"]+\.(?:pdf|jpg|jpeg|png|webp))"/gi)) {
    const id = m[1], name = m[2];
    const ext = name.split('.').pop().toLowerCase();
    files.set(id, {
      name,
      url: 'https://drive.google.com/uc?export=download&id=' + id,
      type: ext === 'pdf' ? 'pdf' : 'image',
    });
  }

  // Subfolder pattern: /folders/ID in hrefs or data attributes
  for (const m of html.matchAll(/\/folders\/([a-zA-Z0-9_-]{20,})/g)) {
    if (m[1] !== currentFolderId) folderIds.add(m[1]);
  }
  // Also catch folder IDs in data-id or similar attributes
  for (const m of html.matchAll(/data-id="([a-zA-Z0-9_-]{25,})"/g)) {
    // Heuristic: if it appears near "folder" text, treat as folder
    const ctx = html.substring(Math.max(0, m.index - 100), m.index + 100).toLowerCase();
    if (ctx.includes('folder') && m[1] !== currentFolderId) folderIds.add(m[1]);
  }

  return { files: Array.from(files.values()), folderIds: Array.from(folderIds) };
}

async function fetchDriveFolder(folderId, visited = new Set(), depth = 0) {
  if (depth > 2 || visited.has(folderId)) return [];
  visited.add(folderId);

  try {
    const url = 'https://drive.google.com/drive/folders/' + folderId;
    console.log('[DriveImport] Fetching folder depth=' + depth, folderId);
    const r = await fetch(url, FETCH_OPTS);
    if (!r.ok) return [];
    const html = await r.text();
    const { files, folderIds } = extractFromDriveHtml(html, folderId);
    console.log('[DriveImport] depth=' + depth, 'files=' + files.length, 'subfolders=' + folderIds.length);

    // Recurse into subfolders (serially to avoid hammering Drive)
    const allFiles = [...files];
    for (const subfolderId of folderIds) {
      const subFiles = await fetchDriveFolder(subfolderId, visited, depth + 1);
      allFiles.push(...subFiles);
    }
    return allFiles;
  } catch (e) {
    console.warn('[DriveImport] Error at depth=' + depth, e.message);
    return [];
  }
}

function parseGoogleDrive(html, folderUrl) {
  // For a single file link (not a folder)
  if (!folderUrl.includes('/folders/')) {
    const idMatch = folderUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (idMatch) {
      const id = idMatch[1];
      const name = decodeURIComponent(folderUrl.split('/').pop()) || 'Document';
      return [{ name, url: 'https://drive.google.com/uc?export=download&id=' + id, type: 'pdf' }];
    }
  }
  // For folder links, extract from current page only (recursion handled separately)
  const { files } = extractFromDriveHtml(html, getDriveFolderId(folderUrl) || '');
  return files;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { folderUrl } = req.body || {};
  if (!folderUrl) return res.status(400).json({ error: 'folderUrl required' });

  try {
    let allFiles = [];

    if (folderUrl.includes('drive.google')) {
      const folderId = getDriveFolderId(folderUrl);
      if (folderId) {
        // Recursive fetch including subfolders
        allFiles = await fetchDriveFolder(folderId);
      } else {
        // Single file link
        const r = await fetch(folderUrl, FETCH_OPTS);
        const html = await r.text();
        allFiles = parseGoogleDrive(html, folderUrl);
      }
    } else if (folderUrl.includes('dropbox.com')) {
      const r = await fetch(folderUrl, FETCH_OPTS);
      const html = await r.text();
      allFiles = parseDropbox(html, folderUrl);
    } else {
      return res.status(400).json({ error: 'Only Dropbox and Google Drive URLs supported' });
    }

    // Deduplicate by URL
    const unique = [...new Map(allFiles.map(f => [f.url, f])).values()];
    console.log('[DriveImport] Total unique files:', unique.length);

    return res.status(200).json({
      files: unique,
      pdfs: unique.filter(f => f.type === 'pdf'),
      images: unique.filter(f => f.type === 'image'),
      count: unique.length,
    });
  } catch (err) {
    console.error('[DriveImport] Fatal:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
