import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import sitemap from '../src/app/sitemap';
import { prompts } from '../src/lib/prompts';

const origin = 'https://www.obsidianui.dev';

test('robots explicitly allows requested crawlers and the wildcard without restrictive directives', () => {
    const robots = fs.readFileSync('public/robots.txt', 'utf8');
    const groups = new Map<string, string[]>();
    let currentAgent = '';
    for (const line of robots.split(/\r?\n/)) {
        const cleaned = line.split('#')[0].trim();
        if (!cleaned) continue;
        const separator = cleaned.indexOf(':');
        assert.ok(separator > 0, `Invalid robots directive: ${cleaned}`);
        const directive = cleaned.slice(0, separator).toLowerCase();
        const value = cleaned.slice(separator + 1).trim();
        assert.ok(['user-agent', 'allow', 'sitemap'].includes(directive), cleaned);
        if (directive === 'user-agent') {
            currentAgent = value;
            assert.equal(groups.has(value), false, `Duplicate crawler group: ${value}`);
            groups.set(value, []);
        } else if (directive === 'allow') {
            assert.ok(currentAgent, 'Allow must belong to a crawler group');
            groups.get(currentAgent)!.push(value);
        } else {
            assert.equal(value, `${origin}/sitemap.xml`);
        }
    }
    for (const agent of ['ChatGPT-User', 'ClaudeBot', 'Google-Extended', 'DeepSeekBot', 'GPTBot', 'PerplexityBot', 'Applebot-Extended', 'ora-agent', '*']) {
        assert.deepEqual(groups.get(agent), ['/'], `Crawler must be allowed: ${agent}`);
    }
    assert.match(robots, /^Sitemap: https:\/\/www\.obsidianui\.dev\/sitemap\.xml$/m);
});

test('sitemap covers every published document and static page with canonical, unique URLs', async () => {
    const entries = await sitemap();
    const urls = entries.map(entry => entry.url);
    assert.equal(new Set(urls).size, urls.length, 'No duplicate canonical URLs');
    assert.equal(fs.existsSync('public/sitemap.xml'), false, 'A static sitemap must not shadow the metadata route');

    const documentFiles = fs.readdirSync('src/content', { recursive: true })
        .map(String).filter(file => /\.mdx?$/.test(file) && !file.split(path.sep).some(segment => segment.startsWith('_') || segment.startsWith('.')));
    const documentPaths = documentFiles.filter(file => file !== 'index.mdx' && file !== 'index.md').map(file => {
        const segments = file.replace(/\.mdx?$/, '').split(path.sep);
        if (segments.at(-1) === 'index') segments.pop();
        return '/docs/' + segments.map(encodeURIComponent).join('/');
    });
    const pageFiles = fs.readdirSync('src/app', { recursive: true })
        .map(String).filter(file => /(^|[\\/])page\.[tj]sx?$/.test(file) && !file.includes('['))
        // noindex pages (for example the post-checkout thank-you page) stay out of the sitemap.
        .filter(file => !/robots:\s*\{\s*index:\s*false/.test(fs.readFileSync(path.join('src/app', file), 'utf8')));
    const pagePaths = pageFiles.map(file => '/' + file.split(path.sep).slice(0, -1).join('/'));
    const promptPaths = prompts.map(prompt => `/prompts/${prompt.slug}`);
    const expected = new Set([...documentPaths, ...pagePaths, ...promptPaths].map(route => new URL(route, origin).href));
    assert.deepEqual(new Set(urls), expected, 'Every sitemap URL must match a real published page');
    assert.ok(!urls.includes(`${origin}/docs`), 'The redirecting docs root is not canonical');
    for (const url of urls) {
        const parsed = new URL(url);
        assert.equal(parsed.origin, origin);
        assert.equal(parsed.search, '');
        assert.equal(parsed.hash, '');
    }
});

test('every sitemap entry says when it changed and how much it matters', async () => {
    const entries = await sitemap();
    for (const entry of entries) {
        assert.match(String(entry.lastModified), /^\d{4}-\d{2}-\d{2}$/, `${entry.url} needs a lastModified date`);
        assert.ok(typeof entry.priority === 'number' && entry.priority > 0 && entry.priority <= 1, `${entry.url} needs a priority`);
        assert.ok(entry.changeFrequency, `${entry.url} needs a changeFrequency`);
    }
    assert.equal(entries.find(entry => entry.url === `${origin}/`)?.priority, 1);
});
