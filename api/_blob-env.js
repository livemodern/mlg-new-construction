// api/_blob-env.js — find the Vercel Blob token regardless of env var name.
// Vercel Blob tokens always have values starting with "vercel_blob_rw_".
// The env var name is whatever prefix the user picked when connecting:
//   default prefix "BLOB" → BLOB_READ_WRITE_TOKEN
//   prefix "MLG"          → MLG_READ_WRITE_TOKEN
// We don't care about the name — we identify by value.

export function getBlobToken() {
  // Try the standard name first (covers 95% of installs)
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  // Otherwise, find any env var whose VALUE looks like a Vercel Blob token
  for (const v of Object.values(process.env)) {
    if (typeof v === 'string' && v.startsWith('vercel_blob_rw_')) return v;
  }
  return null;
}
