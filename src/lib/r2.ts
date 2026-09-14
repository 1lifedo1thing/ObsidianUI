import manifest from "../../scripts/r2-manifest.json";

const R2_BASE = (process.env.NEXT_PUBLIC_R2_URL || 'https://pub-830233752de349e29c6104a501b309d4.r2.dev').replace(/\/$/, '');
const uploadedAssets = manifest as Record<string, string>;

/**
 * Resolves a public asset path to the Cloudflare R2 CDN URL.
 * If the path is already a full URL, returns it directly.
 * Example: r2('/effects/book-flip/book-flip-img01.png')
 *       -> 'https://pub-830233752de349e29c6104a501b309d4.r2.dev/effects/book-flip/book-flip-img01.png'
 */
export function r2(assetPath: string): string {
  if (!assetPath) return '';
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const uploadedUrl = uploadedAssets[cleanPath];
  if (!uploadedUrl) {
    throw new Error(`Asset is not present in the Cloudflare R2 manifest: ${assetPath}`);
  }
  return uploadedUrl;
}

/** Resolves a directory containing at least one uploaded R2 asset. */
export function r2Prefix(prefix: string): string {
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  if (!Object.keys(uploadedAssets).some((key) => key.startsWith(`${cleanPrefix}/`))) {
    throw new Error(`Asset directory is not present in the Cloudflare R2 manifest: ${prefix}`);
  }
  return `${R2_BASE}/${cleanPrefix}`;
}
