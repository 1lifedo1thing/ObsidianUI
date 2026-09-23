import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { readRegistryCatalog, readRegistryResource } from '../scripts/mcp-resources';

test('MCP only reads exact resource names advertised in the standard catalog', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-mcp-test-'));
    t.after(() => {
        if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('obsidian-mcp-test-')) throw new Error('Unexpected test directory');
        fs.rmSync(root, { recursive: true, force: true });
    });
    fs.mkdirSync(path.join(root, 'public/r'), { recursive: true });
    fs.writeFileSync(path.join(root, 'public/r/registry.json'), JSON.stringify({ name: 'obsidian-ui', items: [{ name: 'demo-card' }] }));
    fs.writeFileSync(path.join(root, 'public/r/demo-card.json'), '{"name":"demo-card"}');
    fs.writeFileSync(path.join(root, 'public/r/unlisted.json'), '{}');
    fs.writeFileSync(path.join(root, 'package.json'), '{"name":"outside-registry"}');
    assert.equal(readRegistryCatalog(root).items.length, 1);
    assert.equal(readRegistryResource(root, 'obsidian://demo-card'), '{"name":"demo-card"}');
    for (const uri of ['obsidian://../../package', 'obsidian://%2e%2e%2fpackage', 'obsidian://..\\..\\package', 'file://demo-card', 'demo-card', 'obsidian://demo-card?x=1', 'obsidian://demo-card#fragment', 'obsidian://unlisted']) {
        assert.throws(() => readRegistryResource(root, uri), uri);
    }
    fs.writeFileSync(path.join(root, 'public/r/registry.json'), '[]');
    assert.throws(() => readRegistryCatalog(root), /Invalid registry catalog/);
});
