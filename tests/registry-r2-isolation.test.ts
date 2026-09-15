import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildRegistry, REGISTRY_EXCLUDE } from '../scripts/registry';

/**
 * Regression: no registry item should bundle r2 runtime-only lib files.
 *
 * Guards against the Vercel build failure where block components importing
 * lib/r2 caused the registry builder to inline r2.ts + r2-manifest.json
 * into shadcn packages, breaking the Vercel build.
 *
 * If this test fails: find the block/ui component importing lib/r2 and
 * replace the r2() call with a direct CDN URL in the default prop value.
 */

test('REGISTRY_EXCLUDE contains r2 lib entries', () => {
    assert.ok(REGISTRY_EXCLUDE.has('lib/r2.ts'), 'lib/r2.ts must be in REGISTRY_EXCLUDE');
    assert.ok(REGISTRY_EXCLUDE.has('lib/r2-manifest.json'), 'lib/r2-manifest.json must be in REGISTRY_EXCLUDE');
});

test('no registry item bundles r2 lib files — full project', () => {
    const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
    let registry;
    try {
        registry = buildRegistry(projectRoot);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('runtime-only module')) {
            assert.fail(
                'Registry contamination: a block/ui component imports lib/r2. ' +
                'Replace r2() calls with direct CDN URLs. Original error: ' + message
            );
        }
        throw err;
    }

    for (const item of registry.items) {
        const r2Files = item.files.filter((f) => /lib\/r2/.test(f.path));
        assert.deepEqual(
            r2Files,
            [],
            'Registry item "' + item.name + '" must not bundle r2 lib files. Found: ' +
            r2Files.map((f) => f.path).join(', ')
        );
    }
});

test('REGISTRY_EXCLUDE guard throws on accidental r2 import in block', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-r2-isolation-test-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const put = (filename: string, content: string) => {
        const target = path.join(root, filename);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    };

    // A block that imports r2 — this should now throw a clear error
    put('src/components/block/bad-block.tsx', [
        "import { r2 } from '@/lib/r2';",
        "export const Bad = () => <img src={r2('/effects/foo.png')} />;",
    ].join('\n'));
    put('src/lib/r2.ts', [
        "import manifest from './r2-manifest.json';",
        "const m = manifest as Record<string, string>;",
        "export function r2(p: string): string { return m[p.slice(1)] ?? p; }",
    ].join('\n'));
    put('src/lib/r2-manifest.json', '{"effects/foo.png":"https://cdn.example.com/foo.png"}');

    assert.throws(
        () => buildRegistry(root),
        (err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            return message.includes('runtime-only module');
        },
        'buildRegistry must throw a descriptive error when a block imports lib/r2'
    );
});