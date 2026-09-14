import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const sourceFiles = [
    { step: 2, language: 'tsx', path: 'components/block/hover-img.tsx' },
    { step: 3, language: 'css', path: 'components/block/hover-img.css' },
];

function normalizeSource(source: string) {
    return source.replace(/\r\n?/g, '\n').trimEnd();
}

test('Hover Image manual cards contain each complete canonical registry file exactly once', () => {
    const mdx = fs.readFileSync(new URL('../src/content/hover-img.mdx', import.meta.url), 'utf8').replace(/\r\n?/g, '\n');
    const registry = JSON.parse(fs.readFileSync(new URL('../public/r/hover-img.json', import.meta.url), 'utf8')) as {
        files: { path: string; content: string }[];
    };

    assert.deepEqual(registry.files.map(file => file.path).sort(), sourceFiles.map(file => file.path).sort(), 'Document every required source file when the registry changes');
    assert.doesNotMatch(mdx, /\bsource\s*=\s*["']hover-img["']/, 'Manual cards must not also render the source-file selector');

    for (const source of sourceFiles) {
        const file = registry.files.find(file => file.path === source.path);
        assert.ok(file, `Missing registry file: ${source.path}`);
        const card = mdx.match(new RegExp('<Dependencies\\b(?=[^>]*\\bstep=\\{' + source.step + '\\})([^>]*)>([\\s\\S]*?)<\\/Dependencies>'));
        assert.ok(card, `Missing step ${source.step} installation card`);
        assert.match(card[1], /className=["']docs-source-card["']/);
        assert.ok(card[2].includes(source.path), `Step ${source.step} must identify its destination file`);

        const expandable = card[2].match(/<ExpandableBlock\b[^>]*>([\s\S]*?)<\/ExpandableBlock>/);
        assert.ok(expandable, `Step ${source.step} must contain its expandable code block`);
        const fencePattern = '^```' + source.language + '[ \\t]+copy[ \\t]*\\n([\\s\\S]*?)^```[ \\t]*$';
        const fence = expandable[1].match(new RegExp(fencePattern, 'm'));
        assert.ok(fence, `Step ${source.step} must expose its own ${source.language} copy action`);
        assert.equal(normalizeSource(fence[1]), normalizeSource(file.content), `The ${source.language} fence must preserve the entire canonical source, including imports and final lines`);
        assert.equal([...mdx.matchAll(new RegExp('^```' + source.language + '(?:[ \\t]+[^\\n]*)?\\n', 'gm'))].length, 1, `Do not duplicate the ${source.language} source elsewhere on the page`);
    }
});
