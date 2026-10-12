import type { MetadataRoute } from 'next';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { prompts } from '../lib/prompts';
import { docsSearchDetails } from '../lib/site-metadata';

export const dynamic = 'force-static';

type SitemapEntry = MetadataRoute.Sitemap[number];
type PageDetails = Pick<SitemapEntry, 'priority' | 'changeFrequency'> & { lastModified: string };

const origin = 'https://www.obsidianui.dev';
const latestPromptDate = prompts.map(prompt => prompt.date).sort().at(-1) ?? '2026-10-09';

// Update a page's date when its visible content changes, so crawlers can trust it.
const pages: Record<string, PageDetails> = {
    '/': { lastModified: '2026-10-13', priority: 1, changeFrequency: 'weekly' },
    '/components': { lastModified: '2026-10-13', priority: 0.9, changeFrequency: 'weekly' },
    '/templates': { lastModified: '2026-10-13', priority: 0.8, changeFrequency: 'monthly' },
    '/prompts': { lastModified: latestPromptDate, priority: 0.7, changeFrequency: 'weekly' },
    '/project-one': { lastModified: '2026-09-27', priority: 0.6, changeFrequency: 'monthly' },
    '/sponsors': { lastModified: '2026-09-28', priority: 0.5, changeFrequency: 'monthly' },
    '/developers': { lastModified: '2026-09-27', priority: 0.5, changeFrequency: 'monthly' },
    '/api': { lastModified: '2026-09-27', priority: 0.5, changeFrequency: 'monthly' },
    '/authentication': { lastModified: '2026-09-27', priority: 0.5, changeFrequency: 'monthly' },
    '/mcp': { lastModified: '2026-09-27', priority: 0.5, changeFrequency: 'monthly' },
    ...Object.fromEntries(prompts.map(prompt => [
        `/prompts/${prompt.slug}`,
        { lastModified: prompt.date, priority: 0.6, changeFrequency: 'monthly' } satisfies PageDetails,
    ])),
};

function docsDetails(pathname: string): Omit<PageDetails, 'lastModified'> & { lastModified?: string } {
    const search = docsSearchDetails[pathname.split('/').at(-1) ?? ''];
    return {
        lastModified: search?.dateModified,
        priority: search?.category === 'guide' ? 0.7 : 0.8,
        changeFrequency: 'monthly',
    };
}

async function documentationPaths(directory: string, segments: string[] = []): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const routes = await Promise.all(entries.map(async entry => {
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) return [];
        if (entry.isDirectory()) {
            return documentationPaths(path.join(directory, entry.name), [...segments, entry.name]);
        }
        if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) return [];

        const slug = entry.name.replace(/\.mdx?$/, '');
        // The documentation root redirects to /docs/installation.
        if (slug === 'index' && segments.length === 0) return [];
        const routeSegments = slug === 'index' ? segments : [...segments, slug];
        return ['/docs/' + routeSegments.map(encodeURIComponent).join('/')];
    }));
    return routes.flat();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const docs = await documentationPaths(path.join(process.cwd(), 'src', 'content'));
    return [...new Set([...Object.keys(pages), ...docs])].sort().map(pathname => {
        const { lastModified, priority, changeFrequency } = pages[pathname] ?? docsDetails(pathname);
        return {
            url: new URL(pathname, origin).href,
            ...(lastModified && { lastModified }),
            changeFrequency,
            priority,
        };
    });
}
