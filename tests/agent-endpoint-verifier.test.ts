import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localUrl, markdownLinks, registryProblems, robotsAllows, sitemapLocations } from '../scripts/verify-agent-endpoints';

test('verification maps only product URLs to the requested origin and decodes sitemap links', () => {
    const origin = 'http://localhost:3001';
    assert.deepEqual(sitemapLocations('<urlset><url><loc>https://www.obsidianui.dev/docs/a?x=1&amp;y=2</loc></url></urlset>'), ['https://www.obsidianui.dev/docs/a?x=1&y=2']);
    assert.equal(localUrl('https://www.obsidianui.dev/docs/a#usage', origin), origin + '/docs/a');
    assert.equal(localUrl('https://obsidianui.dev/llms.txt', origin), origin + '/llms.txt');
    assert.equal(localUrl('https://external.test/secret', origin), null);
    assert.equal(localUrl('javascript:alert(1)', origin), null);
    assert.deepEqual(markdownLinks('[Docs](/docs/a) [Alias](https://www.obsidianui.dev/docs/a) [GitHub](https://github.com/example) [Source](</r/a.json>)', origin), [origin + '/docs/a', origin + '/r/a.json']);
});

test('robots verification respects specific groups, empty disallows, and longest allow rules', () => {
    const robots = 'User-agent: *\nDisallow:\n\nUser-agent: GPTBot\nDisallow: /\nAllow: /docs/\nDisallow: /docs/private\n';
    assert.equal(robotsAllows(robots, 'ora-agent', '/'), true);
    assert.equal(robotsAllows(robots, 'GPTBot', '/'), false);
    assert.equal(robotsAllows(robots, 'gptbot', '/docs/installation'), true);
    assert.equal(robotsAllows(robots, 'GPTBot', '/docs/private/key'), false);
    assert.equal(robotsAllows('User-agent: *\nDisallow: /*.json$\nAllow: /r/*.json$', 'ClaudeBot', '/r/button.json'), true);
    assert.equal(robotsAllows('User-agent: *\nDisallow: /*.json$', 'ClaudeBot', '/private.json'), false);
    assert.equal(robotsAllows('User-agent: *\nDisallow: /*.json$', 'ClaudeBot', '/private.json/path'), true);
    assert.equal(robotsAllows('User-agent: *\nDisallow: /\nAllow: /', 'DeepSeekBot', '/'), true);
});

test('registry verification catches empty sources, missing dependencies, unsafe and duplicate targets', () => {
    const item = {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json', name: 'demo', type: 'registry:block', dependencies: [],
        files: [{ path: 'components/block/demo.tsx', target: '@components/block/demo.tsx', type: 'registry:block', content: 'export const Demo = () => null;' }],
    };
    assert.deepEqual(registryProblems(item, 'demo'), []);
    assert.match(registryProblems({ ...item, dependencies: undefined }).join(' '), /dependencies/);
    assert.match(registryProblems({ ...item, files: [{ ...item.files[0], content: ' ' }] }).join(' '), /empty/);
    assert.match(registryProblems({ ...item, files: [{ ...item.files[0], target: '../../private' }] }).join(' '), /safe installation target/);
    assert.match(registryProblems({ ...item, files: [...item.files, ...item.files] }).join(' '), /duplicate target/);
    assert.match(registryProblems(item, 'different').join(' '), /differs from catalog/);
});
