import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { DocsCopyPage } from '@/components/docs/docs-copy-page';

type PageProps = { params: Promise<{ mdxPath?: string[] }> };
export const generateStaticParams = generateStaticParamsFor('mdxPath');
// ISR: re-generate at most every hour; unknown paths are rendered on demand and then cached.
export const revalidate = 3600;
export const dynamicParams = true;
const Wrapper = getMDXComponents().wrapper;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { mdxPath } = await params;
    const { metadata } = await importPage(mdxPath);
    const pathname = '/docs' + (mdxPath?.length ? '/' + mdxPath.join('/') : '');
    const title = metadata.title ? `${metadata.title} – ObsidianUI` : 'Documentation – ObsidianUI';
    const description = metadata.description || 'ObsidianUI documentation, component guides, and interactive examples.';
    return {
        ...metadata,
        title,
        description,
        alternates: { canonical: pathname },
        openGraph: {
            title,
            description,
            url: pathname,
            siteName: 'ObsidianUI',
            locale: 'en_US',
            type: 'article',
            images: [
                {
                    url: 'https://www.obsidianui.dev/og-image.png',
                    secureUrl: 'https://www.obsidianui.dev/og-image.png',
                    width: 1917,
                    height: 1078,
                    type: 'image/png',
                    alt: `${title} - ObsidianUI`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            site: '@athrix_codes',
            creator: '@athrix_codes',
            images: [
                {
                    url: 'https://www.obsidianui.dev/og-image.png',
                    width: 1917,
                    height: 1078,
                    alt: `${title} - ObsidianUI`,
                },
            ],
        },
    };
}

export default async function DocumentationPage({ params }: PageProps) {
    const resolvedParams = await params;
    if (!resolvedParams.mdxPath?.length) redirect('/docs/installation');
    const { default: MDXContent, toc, metadata, sourceCode } = await importPage(resolvedParams.mdxPath);
    return (
        <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
            <DocsCopyPage sourceCode={sourceCode} pathname={'/docs/' + resolvedParams.mdxPath.join('/')} />
            <div id="main-content" tabIndex={-1}>
                <MDXContent params={resolvedParams} />
            </div>
        </Wrapper>
    );
}
