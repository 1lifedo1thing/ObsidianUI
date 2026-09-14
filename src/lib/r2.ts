const R2_BASE = (process.env.NEXT_PUBLIC_R2_URL || 'https://pub-830233752de349e29c6104a501b309d4.r2.dev').replace(/\/$/, '');

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
  return `${R2_BASE}/${cleanPath}`;
}
