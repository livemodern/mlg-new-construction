// api/_blob-env.js — find the Vercel Blob token regardless of prefix.
// Vercel lets you set a prefix when connecting a Blob store to a project.
// With prefix "blob", the env var is "blob_BLOB_READ_WRITE_TOKEN".
// With no prefix, it is "BLOB_READ_WRITE_TOKEN".
// This helper finds whichever exists, preferring prefixed (most recently connected).

export function getBlobToken() {
  // Prefer any prefixed token first (someone explicitly set a prefix)
  for (const [k, v] of Object.entries(process.env)) {
    if (/^.+_BLOB_READ_WRITE_TOKEN$/i.test(k) && v) return v;
  }
  // Fall back to the default unprefixed name
  return process.env.BLOB_READ_WRITE_TOKEN || null;
}
