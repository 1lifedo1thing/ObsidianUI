import nextra from 'nextra';

const withNextra = nextra({
    contentDirBasePath: '/docs',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    reactStrictMode: true,
    // Keep RSC headers visible so document negotiation never rewrites navigation streams.
    skipProxyUrlNormalize: true,
    outputFileTracingIncludes: {
        '/api/docs/*/markdown': ['./public/markdown/docs/*.md'],
    },
    async headers() {
        const publicReadHeaders = [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Link', value: '</llms.txt>; rel="describedby"' },
        ];
        // Docs & page cache: s-maxage caches on Vercel edge CDN; stale-while-revalidate serves stale during revalidation.
        const pageCacheHeaders = [
            { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ];
        // Static assets: cache forever in browser and CDN (immutable).
        const staticAssetHeaders = [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ];
        return [
            { source: '/effects/:path*', headers: staticAssetHeaders },
            { source: '/logo/:path*', headers: staticAssetHeaders },
            { source: '/folder-preview/:path*', headers: staticAssetHeaders },
            { source: '/r/:path*', headers: publicReadHeaders },
            { source: '/markdown/:path*', headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
            { source: '/agent-instructions.md', headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
            ...['/llms.txt', '/llm.txt', '/llms-full.txt', '/robots.txt'].map(source => ({ source, headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/plain; charset=utf-8' }] })),
            { source: '/', headers: pageCacheHeaders },
            { source: '/components', headers: pageCacheHeaders },
            { source: '/templates', headers: pageCacheHeaders },
            { source: '/playground', headers: pageCacheHeaders },
            { source: '/docs', headers: pageCacheHeaders },
            { source: '/docs/:path*', headers: pageCacheHeaders },
        ];
    },
    turbopack: {
        resolveAlias: {
            'next-mdx-import-source-file': './src/mdx-components.tsx',
        },
    },
    // Configure allowed image domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn-new.obsidianui.dev',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.jsdelivr.net',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: '*.githubusercontent.com',
            },
        ],
    },
};

export default withNextra(nextConfig);
