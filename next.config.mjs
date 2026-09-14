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
        // Docs pages: ISR-friendly cache. s-maxage tells the Vercel edge to cache the
        // rendered HTML; stale-while-revalidate serves stale while regenerating in background.
        const docsCacheHeaders = [
            { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ];
        return [
            { source: '/r/:path*', headers: publicReadHeaders },
            { source: '/markdown/:path*', headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
            { source: '/agent-instructions.md', headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
            ...['/llms.txt', '/llm.txt', '/llms-full.txt', '/robots.txt'].map(source => ({ source, headers: [...publicReadHeaders, { key: 'Content-Type', value: 'text/plain; charset=utf-8' }] })),
            { source: '/docs', headers: docsCacheHeaders },
            { source: '/docs/:path*', headers: docsCacheHeaders },
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
                hostname: 'pub-830233752de349e29c6104a501b309d4.r2.dev',
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
