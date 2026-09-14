import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Credentials must be set via environment variables
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET || process.env.R2_BUCKET_NAME;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.R2_API_TOKEN;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.hdr': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

// Directories and patterns to include
const UPLOAD_DIRS = [
  'effects',
  'dummy',
  'hover-img',
  'trail-images',
  'folder-preview',
  'logo',
  'audio',
];

// File extensions to match in root public/
const ROOT_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.mp4']);

function getFilesToUpload() {
  const files = [];

  // 1. Walk targeted subdirectories
  for (const dirName of UPLOAD_DIRS) {
    const fullDir = path.join(PUBLIC_DIR, dirName);
    if (!fs.existsSync(fullDir)) continue;

    function walk(current) {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (MIME_MAP[ext]) {
            const relKey = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
            files.push({ fullPath, relKey, ext, size: fs.statSync(fullPath).size });
          }
        }
      }
    }
    walk(fullDir);
  }

  // 2. Add loose root images (skip icons, logos that Next.js / PWA needs locally)
  const SKIP_ROOT_FILES = new Set(['favicon.ico', 'icon.png', 'apple-icon.png', 'manifest.json', 'robots.txt']);
  const rootEntries = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ROOT_IMAGE_EXTENSIONS.has(ext) && !SKIP_ROOT_FILES.has(entry.name)) {
        const fullPath = path.join(PUBLIC_DIR, entry.name);
        files.push({ fullPath, relKey: entry.name, ext, size: fs.statSync(fullPath).size });
      }
    }
  }

  return files;
}

async function uploadFile(file, index, total) {
  const mimeType = MIME_MAP[file.ext] || 'application/octet-stream';
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURI(file.relKey)}`;

  const fileStream = fs.createReadStream(file.fullPath);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  process.stdout.write(`[${index + 1}/${total}] Uploading ${file.relKey} (${sizeMB} MB)... `);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': mimeType,
      'Content-Length': file.size.toString(),
      'cf-r2-cache-control': 'public, max-age=31536000, immutable',
    },
    body: fileStream,
    duplex: 'half',
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log(`FAILED (${res.status} ${res.statusText})`);
    throw new Error(`Upload error for ${file.relKey}: ${errText}`);
  }

  console.log(`DONE`);
  return `${PUBLIC_URL}/${file.relKey}`;
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('==================================================');
  console.log('  Cloudflare R2 Asset Uploader');
  console.log(`  Account:    ${ACCOUNT_ID}`);
  console.log(`  Bucket:     ${BUCKET_NAME}`);
  console.log(`  Public URL: ${PUBLIC_URL}`);
  console.log(`  Mode:       ${isDryRun ? 'DRY RUN (no uploads)' : 'LIVE UPLOAD'}`);
  console.log('==================================================\n');

  const files = getFilesToUpload();
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log(`Found ${files.length} files to upload (${totalMB} MB total).\n`);

  if (isDryRun) {
    for (const f of files) {
      console.log(`  [DRY RUN] ${f.relKey} (${(f.size / 1024).toFixed(1)} KB) -> ${PUBLIC_URL}/${f.relKey}`);
    }
    console.log('\nDry run complete. Run without --dry-run to upload.');
    return;
  }

  const manifest = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const publicCdnUrl = await uploadFile(file, i, files.length);
      manifest[file.relKey] = publicCdnUrl;
      successCount++;
    } catch (err) {
      console.error(`  Error:`, err.message);
      failCount++;
    }
  }

  // Write manifest
  const manifestPath = path.join(ROOT, 'scripts', 'r2-manifest.json');
  const srcManifestPath = path.join(ROOT, 'src', 'lib', 'r2-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(srcManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n==================================================`);
  console.log(`  Upload finished: ${successCount} succeeded, ${failCount} failed.`);
  console.log(`  Manifest saved to: scripts/r2-manifest.json and src/lib/r2-manifest.json`);
  console.log(`==================================================`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
