import type { MetadataRoute } from 'next';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-static';

const origin = 'https://www.obsidianui.dev';
const pagePaths = ['/', '/components', '/templates', '/project-one', '/playground', '/developers', '/api', '/authentication', '/mcp'];

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
    return [...new Set([...pagePaths, ...docs])].sort().map(pathname => ({
        url: new URL(pathname, origin).href,
    }));
}
