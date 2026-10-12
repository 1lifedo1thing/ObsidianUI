import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import routeMap from '../src/lib/generated/agent-route-map.json';
import { createPageMetadata, docsDescriptions, docsSearchDetails, siteDescription } from '../src/lib/site-metadata';

const docsSlugs = fs.readdirSync('src/content')
    .filter(file => /\.mdx?$/.test(file))
    .map(file => file.replace(/\.mdx?$/, ''));

test('every published docs page has a description, search title, keywords, and dates', () => {
    for (const slug of docsSlugs) {
        assert.ok(docsDescriptions[slug], `${slug} needs a description`);
        if (slug === 'index') continue;
        const search = docsSearchDetails[slug];
        assert.ok(search, `${slug} needs search details for keywords and JSON-LD`);
        assert.ok(search.title.length <= 60, `${slug} title is longer than 60 characters`);
        assert.ok(search.keywords.length >= 5, `${slug} needs keywords`);
        assert.match(search.datePublished, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(search.dateModified >= search.datePublished, `${slug} was modified before it was published`);
    }
});

test('pages advertise their Markdown version in the head', () => {
    for (const pathname of ['/components', '/templates', '/docs/installation', '/docs/analytics-dashboard']) {
        const types = createPageMetadata('Title', 'Description', pathname).alternates?.types as Record<string, string> | undefined;
        assert.equal(types?.['text/markdown'], `https://www.obsidianui.dev${(routeMap as Record<string, string>)[pathname]}`);
    }
    assert.equal(createPageMetadata('Title', 'Description', '/missing').alternates?.types, undefined);
});

test('site descriptions read correctly', () => {
    assert.match(siteDescription, /^ObsidianUI is a React /);
    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
    assert.match(manifest.description, /components, blocks/);
    assert.match(manifest.description, /built with/);
});
