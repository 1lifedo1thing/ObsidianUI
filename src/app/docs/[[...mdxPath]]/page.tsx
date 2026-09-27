import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { DocsCopyPage } from '@/components/docs/docs-copy-page';
import { createPageMetadata, docsDescriptions } from '@/lib/site-metadata';

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
    const slug = mdxPath?.at(-1) ?? '';
    const description = metadata.description || docsDescriptions[slug] || 'Browse ObsidianUI documentation and component guides for React and Tailwind CSS.';
    return {
        ...metadata,
        ...createPageMetadata(title, description, pathname, 'article'),
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
