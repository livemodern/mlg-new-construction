// src/lib/img.js
// Wraps any remote image URL through Cloudflare Image Transformations on
// images.mlrecloud.com. CF fetches the source (Vercel Blob, WP, etc.),
// resizes/optimizes/format-converts, and caches the result at the CF edge.
//
// Typical wins:
//   - 1MB rendering  -> 60KB WebP at 800px wide  (18x smaller)
//   - 130KB PNG      -> 40KB JPEG at 800px wide  (3x smaller)
//
// First request to a transformed URL is ~700ms (CF fetch+transform+cache).
// Every subsequent request is ~30ms from the CF edge.
//
// Mirrors the lib/img.ts pattern in livemodern/twocityplazacondos.

export const IMG_HOST = 'images.mlrecloud.com';

/**
 * Build a CF-transformed image URL.
 * @param {string|null|undefined} url - the original source URL
 * @param {number} width  - target render width in CSS pixels
 * @param {number} quality - JPEG/WebP quality (0-100). 80 is the sweet spot.
 * @returns {string} transformed URL, or the original if not transformable
 */
export function imgOpt(url, width = 800, quality = 80) {
  if (!url || typeof url !== 'string') return url || '';
  // Already a CF transform URL — don't double-wrap.
  if (url.includes('/cdn-cgi/image/')) return url;
  // PDFs (floor plans, broker docs) — leave alone, CF Image Transforms is for images only.
  if (/\.(pdf)(\?|$|#)/i.test(url)) return url;
  // Data URLs, blob:, relative paths — pass through unchanged.
  if (!/^https?:\/\//i.test(url)) return url;
  return `https://${IMG_HOST}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${url}`;
}

/**
 * Responsive srcset string. Browser picks the right width based on
 * the viewport and device pixel ratio.
 * @param {string|null|undefined} url
 * @param {number[]} widths - render widths to offer
 * @param {number} quality
 * @returns {string|undefined} comma-separated srcset, or undefined if not applicable
 */
export function imgSrcSet(url, widths = [400, 800, 1200], quality = 80) {
  if (!url || typeof url !== 'string') return undefined;
  if (!/^https?:\/\//i.test(url)) return undefined;
  if (/\.(pdf)(\?|$|#)/i.test(url)) return undefined;
  if (url.includes('/cdn-cgi/image/')) return undefined;
  return widths.map(w => `${imgOpt(url, w, quality)} ${w}w`).join(', ');
}
