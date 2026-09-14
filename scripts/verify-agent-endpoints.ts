import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Read-only verification of the public contract used by coding agents. */
export const AGENT_USER_AGENTS = [
    'GPTBot', 'ClaudeBot', 'ChatGPT-User', 'PerplexityBot',
    'Google-Extended', 'Applebot-Extended', 'DeepSeekBot', 'ora-agent',
] as const;

const PRODUCT_HOSTS = new Set(['obsidianui.dev', 'www.obsidianui.dev']);
const CONCURRENCY = 4;
const TIMEOUT_MS = 20_000;
type RecordValue = Record<string, unknown>;

function object(value: unknown): value is RecordValue {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function decodeXml(value: string): string {
    return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

export function sitemapLocations(xml: string): string[] {
    return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
        .map(match => decodeXml(match[1].trim()));
}

export function localUrl(href: string, origin: string): string | null {
    try {
        const url = new URL(href, origin);
        if (!['https:', 'http:'].includes(url.protocol)) return null;
        if (url.origin !== origin && !PRODUCT_HOSTS.has(url.hostname)) return null;
        return new URL(url.pathname + url.search, origin).href;
    } catch {
        return null;
    }
}

export function markdownLinks(markdown: string, origin: string): string[] {
    return [...new Set([...markdown.matchAll(/\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)]
        .map(match => localUrl(match[1], origin)).filter((url): url is string => url !== null))];
}

/** RFC 9309 longest matching group/rule, including Allow winning equal-length ties. */
export function robotsAllows(robots: string, userAgent: string, pathname: string): boolean {
    const groups: { agents: string[]; rules: { allow: boolean; value: string }[] }[] = [];
    let group: (typeof groups)[number] | undefined;
    let hasDirectives = false;
    for (const line of robots.split(/\r?\n/)) {
        const clean = line.replace(/#.*$/, '').trim();
        const colon = clean.indexOf(':');
        if (colon < 0) continue;
        const key = clean.slice(0, colon).trim().toLowerCase();
        const value = clean.slice(colon + 1).trim();
        if (key === 'user-agent') {
            if (!group || hasDirectives) {
                group = { agents: [], rules: [] };
                groups.push(group);
                hasDirectives = false;
            }
            group.agents.push(value.toLowerCase());
        } else if (group && (key === 'allow' || key === 'disallow')) {
            hasDirectives = true;
            if (value) group.rules.push({ allow: key === 'allow', value });
        }
    }
    const agent = userAgent.toLowerCase();
    const exact = groups.filter(item => item.agents.includes(agent));
    const matched = exact.length ? exact : groups.filter(item => item.agents.includes('*'));
    const rules = matched.flatMap(item => item.rules).filter(rule => {
        const expression = rule.value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\\$$/, '$').replace(/\*/g, '.*');
        return new RegExp('^' + expression).test(pathname);
    }).sort((a, b) => b.value.length - a.value.length || Number(b.allow) - Number(a.allow));
    return rules[0]?.allow ?? true;
}

export function registryProblems(item: unknown, expectedName?: string): string[] {
    if (!object(item)) return ['item is not an object'];
    const problems: string[] = [];
    if (typeof item.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name)) problems.push('invalid name');
    if (expectedName && item.name !== expectedName) problems.push('name differs from catalog');
    if (item.$schema !== 'https://ui.shadcn.com/schema/registry-item.json') problems.push('missing registry-item schema');
    if (typeof item.type !== 'string' || !item.type.startsWith('registry:')) problems.push('missing item type');
    if (!Array.isArray(item.dependencies) || item.dependencies.some(value => typeof value !== 'string' || !value.trim())) {
        problems.push('dependencies must be an array of package names');
    }
    if (!Array.isArray(item.files) || !item.files.length) return [...problems, 'no downloadable source files'];
    const targets = new Set<string>();
    for (const [index, file] of item.files.entries()) {
        if (!object(file)) { problems.push(`file ${index} is not an object`); continue; }
        if (typeof file.path !== 'string' || !file.path.trim()) problems.push(`file ${index} has no source path`);
        if (typeof file.target !== 'string' || !file.target.trim() || /(^|[\\/])\.\.([\\/]|$)/.test(file.target)) {
            problems.push(`file ${index} has no safe installation target`);
        } else {
            if (targets.has(file.target)) problems.push(`duplicate target ${file.target}`);
            targets.add(file.target);
        }
        if (typeof file.type !== 'string' || !file.type.startsWith('registry:')) problems.push(`file ${index} has no registry type`);
        if (typeof file.content !== 'string' || !file.content.trim()) problems.push(`file ${index} is empty`);
    }
    return problems;
}

async function concurrent<T>(items: T[], run: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
        while (next < items.length) await run(items[next++]);
    }));
}

export async function verifyAgentEndpoints(origin: string): Promise<boolean> {
    const failures: string[] = [];
    let requests = 0;
    let fileCount = 0;
    const check = (condition: boolean, message: string) => { if (!condition) failures.push(message); };
    const get = async (url: string, accept = '*/*', userAgent = 'ObsidianUI-Agent-Verification/1.0', options: { method?: 'HEAD'; headers?: Record<string, string> } = {}) => {
        requests++;
        try {
            const response = await fetch(url, {
                method: options.method,
                headers: { Accept: accept, 'User-Agent': userAgent, ...options.headers },
                signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow',
            });
            const body = await response.text();
            return { response, body };
        } catch (error) {
            failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    };
    const expectMarkdown = (result: Awaited<ReturnType<typeof get>>, label: string, status = 200) => {
        if (!result) return;
        check(result.response.status === status, `${label}: HTTP ${result.response.status}, expected ${status}`);
        check(/^text\/markdown\b/i.test(result.response.headers.get('content-type') ?? ''), `${label}: not text/markdown`);
        check(result.body.trim().startsWith('# '), `${label}: missing Markdown H1`);
        check(!/^\s*<!doctype html/i.test(result.body), `${label}: HTML served as Markdown`);
    };
    const expectVary = (result: Awaited<ReturnType<typeof get>>, label: string) => {
        if (!result) return;
        check((result.response.headers.get('vary') ?? '').split(',').some(value => value.trim().toLowerCase() === 'accept'), `${label}: Vary missing Accept`);
    };

    console.log(`Verifying agent endpoints at ${origin}`);
    const sitemap = await get(new URL('/sitemap.xml', origin).href);
    check(sitemap?.response.status === 200, 'sitemap.xml: unavailable');
    const queue = sitemap ? sitemapLocations(sitemap.body) : [];
    const pages = new Set<string>();
    const visitedSitemaps = new Set<string>();
    while (queue.length) {
        const href = queue.shift()!;
        const url = localUrl(href, origin);
        if (!url) { failures.push(`sitemap references unexpected external URL ${href}`); continue; }
        if (new URL(url).pathname.endsWith('.xml')) {
            if (visitedSitemaps.has(url)) continue;
            visitedSitemaps.add(url);
            const nested = await get(url);
            check(nested?.response.status === 200, `${url}: sitemap unavailable`);
            if (nested) queue.push(...sitemapLocations(nested.body));
        } else pages.add(url);
    }
    check(pages.size > 0, 'sitemap contains no public pages');
    await concurrent([...pages], async url => {
        const html = await get(url, 'text/html');
        check(html?.response.status === 200, `${url}: HTML unavailable (${html?.response.status ?? 'request failed'})`);
        if (html) {
            check(/^text\/html\b/i.test(html.response.headers.get('content-type') ?? ''), `${url}: HTML media type missing`);
            expectVary(html, `${url} HTML`);
            if (new URL(url).pathname === '/') {
                const content = html.body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                check(content.length >= 500, `homepage: only ${content.length} raw HTML text characters`);
                const headings = [...html.body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').matchAll(/<h([1-6])\b/gi)].map(match => Number(match[1]));
                check(headings.includes(1), 'homepage: no server-rendered H1');
                check(!headings.some((level, index) => index > 0 && level > headings[index - 1] + 1), 'homepage: heading hierarchy skips a level');
                const counts = [...new Set(headings)].sort().map(level => `H${level}: ${headings.filter(value => value === level).length}`).join(', ');
                console.log(`Homepage raw HTML: ${content.length} text characters; ${headings.length} headings (${counts}).`);
            }
        }
        const markdown = await get(url, 'text/markdown');
        expectMarkdown(markdown, `${url} Markdown`);
        expectVary(markdown, `${url} Markdown`);
    });
    console.log(`Checked ${pages.size} sitemap pages in HTML and Markdown.`);

    const machineFiles = ['/llms.txt', '/llm.txt', '/llms-full.txt', '/agent-instructions.md'];
    const instructionLinks = new Set<string>();
    const instructionBodies = new Map<string, string>();
    await concurrent(machineFiles, async pathname => {
        const result = await get(new URL(pathname, origin).href);
        check(result?.response.status === 200, `${pathname}: unavailable`);
        if (!result) return;
        instructionBodies.set(pathname, result.body);
        check(!/text\/html/i.test(result.response.headers.get('content-type') ?? ''), `${pathname}: served as HTML`);
        check(result.body.trim().startsWith('# ObsidianUI'), `${pathname}: missing ObsidianUI title`);
        if (pathname !== '/llms-full.txt') {
            check(/when to use/i.test(result.body), `${pathname}: missing when-to-use guidance`);
            check(/\/r\//.test(result.body), `${pathname}: missing registry download information`);
            for (const url of markdownLinks(result.body, origin)) instructionLinks.add(url);
        }
    });
    check(instructionBodies.get('/llms.txt') === instructionBodies.get('/llm.txt'), 'llm.txt differs from the standard llms.txt');
    await concurrent([...instructionLinks].filter(url => !pages.has(url)), async url => {
        const result = await get(url);
        check(result?.response.status === 200, `instruction link ${url}: HTTP ${result?.response.status ?? 'request failed'}`);
    });
    const documentPaths = [...new Set([...pages].map(url => new URL(url).pathname).concat('/docs'))];
    let legacyEndpoints = 0;
    await concurrent(documentPaths, async pathname => {
        const direct = `/markdown/${pathname === '/' ? 'index' : pathname.slice(1)}.md`;
        const alias = pathname === '/' ? '/index.md' : `${pathname}.md`;
        for (const resource of [direct, alias]) {
            const result = await get(new URL(resource, origin).href, 'text/markdown');
            expectMarkdown(result, resource);
            const head = await get(new URL(resource, origin).href, 'text/markdown', undefined, { method: 'HEAD' });
            if (head) {
                check(head.response.status === 200, `${resource} HEAD: HTTP ${head.response.status}`);
                check(/^text\/markdown\b/i.test(head.response.headers.get('content-type') ?? ''), `${resource} HEAD: not text/markdown`);
                check(head.body.length === 0, `${resource} HEAD: unexpected body`);
            }
        }
        if (/^\/docs\/[^/]+$/.test(pathname)) {
            const endpoint = `/api/docs/${pathname.slice('/docs/'.length)}/markdown`;
            expectMarkdown(await get(new URL(endpoint, origin).href, 'text/markdown'), endpoint);
            legacyEndpoints++;
        }
    });
    const preferences: [string, 'text/html' | 'text/markdown', number][] = [
        ['text/markdown;q=1, text/html;q=0.5', 'text/markdown', 200],
        ['text/markdown;q=0.2, text/html;q=0.9', 'text/html', 200],
        ['text/markdown;q=0, text/*;q=0.8', 'text/html', 200],
        ['text/html;q=0, text/markdown;q=0', 'text/markdown', 406],
        ['application/json', 'text/markdown', 406],
        ['*/*', 'text/html', 200],
        ['text/markdown; charset=utf-8', 'text/markdown', 200],
        ['text/markdown;q=0.8, text/html;q=0.8', 'text/markdown', 200],
    ];
    for (const pathname of ['/', '/docs/installation']) {
        const url = new URL(pathname, origin).href;
        for (const [accept, type, status] of preferences) {
            const result = await get(url, accept);
            const label = `${pathname} Accept: ${accept}`;
            if (result) {
                check(result.response.status === status, `${label}: HTTP ${result.response.status}, expected ${status}`);
                check((result.response.headers.get('content-type') ?? '').startsWith(type), `${label}: expected ${type}`);
                expectVary(result, label);
            }
        }
        for (const accept of ['text/html', 'text/markdown']) {
            const result = await get(url, accept, undefined, { method: 'HEAD' });
            if (result) {
                check(result.response.status === 200, `${pathname} negotiated HEAD: HTTP ${result.response.status}`);
                check((result.response.headers.get('content-type') ?? '').startsWith(accept), `${pathname} negotiated HEAD: expected ${accept}`);
                check(result.body.length === 0, `${pathname} negotiated HEAD: unexpected body`);
                expectVary(result, `${pathname} negotiated HEAD ${accept}`);
            }
        }
    }
    for (const accept of ['text/x-component', 'text/markdown']) {
        const stream = await get(new URL('/', origin).href, accept, undefined, { headers: { RSC: '1' } });
        if (stream) {
            check(stream.response.status === 200 && /^text\/x-component\b/i.test(stream.response.headers.get('content-type') ?? ''), `React navigation (Accept: ${accept}): expected a 200 RSC stream`);
            const vary = (stream.response.headers.get('vary') ?? '').split(',').map(value => value.trim().toLowerCase());
            for (const field of ['accept', 'rsc', 'next-router-state-tree', 'next-router-prefetch']) check(vary.includes(field), `React navigation (Accept: ${accept}): Vary missing ${field}`);
        }
    }
    console.log(`Checked ${documentPaths.length} direct Markdown files and ${documentPaths.length} .md aliases with GET/HEAD, ${legacyEndpoints} legacy Markdown endpoints, 16 Accept preference cases, negotiated HEAD, and React navigation cache headers.`);
    const openapi = await get(new URL('/openapi.json', origin).href, 'application/json');
    check(openapi?.response.status === 200, 'openapi.json: unavailable');
    if (openapi) {
        try {
            const spec: unknown = JSON.parse(openapi.body);
            check(object(spec) && typeof spec.openapi === 'string' && /^3\./.test(spec.openapi), 'openapi.json: missing OpenAPI 3 version');
            check(object(spec) && object(spec.paths) && Object.keys(spec.paths).length > 0, 'openapi.json: no documented endpoints');
            check(object(spec) && object(spec.info) && typeof spec.info.title === 'string' && spec.info.title.includes('ObsidianUI'), 'openapi.json: missing product title');
        } catch { failures.push('openapi.json: invalid JSON'); }
    }

    await concurrent([...AGENT_USER_AGENTS], async userAgent => {
        const home = await get(new URL('/', origin).href, 'text/html', userAgent);
        check(home?.response.status === 200, `${userAgent}: homepage HTTP ${home?.response.status ?? 'request failed'}`);
        const robots = await get(new URL('/robots.txt', origin).href, 'text/plain', userAgent);
        check(robots?.response.status === 200, `${userAgent}: robots.txt HTTP ${robots?.response.status ?? 'request failed'}`);
        if (robots && robots.response.ok) {
            for (const pathname of ['/', '/components', '/docs/installation', '/llms.txt', '/r/index.json']) {
                check(robotsAllows(robots.body, userAgent, pathname), `${userAgent}: robots disallows ${pathname}`);
            }
            check(/^Sitemap:\s*https?:\/\//im.test(robots.body), `${userAgent}: robots missing sitemap`);
        }
    });

    for (const pathname of ['/agent-verification-does-not-exist', '/docs/agent-verification-does-not-exist']) {
        const url = new URL(pathname, origin).href;
        const html = await get(url, 'text/html');
        check(html?.response.status === 404, `${pathname}: HTML not-found status is ${html?.response.status ?? 'request failed'}`);
        const markdown = await get(url, 'text/markdown');
        expectMarkdown(markdown, `${pathname} Markdown`, 404);
        expectVary(markdown, `${pathname} Markdown`);
        if (markdown) check(/llms\.txt/.test(markdown.body) && /sitemap\.xml/.test(markdown.body), `${pathname}: missing recovery links`);
    }

    const catalog = await get(new URL('/r/index.json', origin).href, 'application/json');
    check(catalog?.response.status === 200, 'registry catalog: unavailable');
    const catalogAlias = await get(new URL('/r/registry.json', origin).href, 'application/json');
    check(catalogAlias?.response.status === 200, 'registry.json alias: unavailable');
    if (catalog && catalogAlias) check(catalog.body === catalogAlias.body, 'registry.json alias differs from index.json');
    let items: unknown[] = [];
    if (catalog) {
        try {
            const parsed: unknown = JSON.parse(catalog.body);
            if (object(parsed) && Array.isArray(parsed.items)) items = parsed.items;
            else failures.push('registry catalog: missing items array');
        } catch { failures.push('registry catalog: invalid JSON'); }
    }
    check(items.length > 0, 'registry catalog: no downloadable components');
    const names = new Set<string>();
    await concurrent(items, async item => {
        const label = object(item) && typeof item.name === 'string' ? item.name : 'unnamed';
        for (const problem of registryProblems(item)) failures.push(`catalog ${label}: ${problem}`);
        if (!object(item) || typeof item.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name)) return;
        check(!names.has(item.name), `registry catalog: duplicate ${item.name}`);
        names.add(item.name);
        const result = await get(new URL(`/r/${item.name}.json`, origin).href, 'application/json');
        check(result?.response.status === 200, `registry ${item.name}: unavailable`);
        if (!result) return;
        try {
            const downloaded: unknown = JSON.parse(result.body);
            for (const problem of registryProblems(downloaded, item.name)) failures.push(`registry ${item.name}: ${problem}`);
            check(JSON.stringify(downloaded) === JSON.stringify(item), `registry ${item.name}: individual payload differs from catalog`);
            if (object(downloaded) && Array.isArray(downloaded.files)) fileCount += downloaded.files.length;
        } catch { failures.push(`registry ${item.name}: invalid JSON`); }
    });
    console.log(`Checked ${items.length} downloadable components (${fileCount} packaged files), ${machineFiles.length} instruction files, ${instructionLinks.size} internal instruction links, OpenAPI, eight agent identities, and real 404s.`);
    if (failures.length) {
        console.error(`${failures.length} verification failure(s) across ${requests} HTTP requests:`);
        for (const failure of failures) console.error(`- ${failure}`);
        return false;
    }
    console.log(`PASS: ${requests} HTTP requests; every checked agent endpoint passed.`);
    return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const value = process.argv[2] ?? 'http://localhost:3001';
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/') {
            throw new Error('Use an HTTP(S) origin without credentials or a path.');
        }
        verifyAgentEndpoints(url.origin).then(passed => { if (!passed) process.exitCode = 1; }).catch(error => {
            console.error('Agent verification failed:', error instanceof Error ? error.message : String(error));
            process.exitCode = 1;
        });
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    }
}
