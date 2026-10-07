import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { DocsCopyPage } from '@/components/docs/docs-copy-page';
import { r2 } from '@/lib/r2';
import { createPageMetadata, docsDescriptions, docsSearchDetails } from '@/lib/site-metadata';

type PageProps = { params: Promise<{ mdxPath?: string[] }> };
export const generateStaticParams = generateStaticParamsFor('mdxPath');
// ISR: re-generate at most every hour; unknown paths are rendered on demand and then cached.
export const revalidate = 3600;
export const dynamicParams = true;
const Wrapper = getMDXComponents().wrapper;
const origin = 'https://www.obsidianui.dev';

function docsDescription(slug: string, description?: string | null) {
    return description || docsDescriptions[slug] || 'Browse ObsidianUI documentation and component guides for React and Tailwind CSS.';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { mdxPath } = await params;
    const { metadata } = await importPage(mdxPath);
    const pathname = '/docs' + (mdxPath?.length ? '/' + mdxPath.join('/') : '');
    const slug = mdxPath?.at(-1) ?? '';
    const search = docsSearchDetails[slug];
    const title = search?.title ?? (metadata.title ? `${metadata.title} – ObsidianUI` : 'Documentation – ObsidianUI');
    return {
        ...metadata,
        ...createPageMetadata(title, docsDescription(slug, metadata.description), pathname, 'article'),
        ...(search && { keywords: search.keywords }),
    };
}

function structuredData(slug: string, heading: string, description: string) {
    const search = docsSearchDetails[slug];
    if (!search) return null;
    const url = `${origin}/docs/${slug}`;
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'TechArticle',
                '@id': `${url}#article`,
                headline: heading,
                name: search.title,
                description,
                url,
                mainEntityOfPage: url,
                image: r2('/og-image.png'),
                keywords: search.keywords.join(', '),
                inLanguage: 'en',
                datePublished: search.datePublished,
                dateModified: search.dateModified,
                author: { '@id': `${origin}/#organization` },
                publisher: { '@id': `${origin}/#organization` },
                isPartOf: { '@id': `${origin}/#website` },
                about: { '@id': `${url}#source` },
            },
            {
                '@type': 'SoftwareSourceCode',
                '@id': `${url}#source`,
                name: heading,
                description,
                codeRepository: 'https://github.com/Atharvsinh-codez/ObsidianUI',
                programmingLanguage: ['TypeScript', 'React'],
                license: 'https://opensource.org/licenses/MIT',
                author: { '@id': `${origin}/#organization` },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                    { '@type': 'ListItem', position: 2, name: 'Docs', item: `${origin}/docs/installation` },
                    { '@type': 'ListItem', position: 3, name: heading, item: url },
                ],
            },
        ],
    };
}

export default async function DocumentationPage({ params }: PageProps) {
    const resolvedParams = await params;
    if (!resolvedParams.mdxPath?.length) redirect('/docs/installation');
    const { default: MDXContent, toc, metadata, sourceCode } = await importPage(resolvedParams.mdxPath);
    const slug = resolvedParams.mdxPath.at(-1) ?? '';
    const jsonLd = structuredData(slug, metadata.title ?? slug, docsDescription(slug, metadata.description));
    return (
        <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
            <DocsCopyPage sourceCode={sourceCode} pathname={'/docs/' + resolvedParams.mdxPath.join('/')} />
            <div id="main-content" tabIndex={-1}>
                <MDXContent params={resolvedParams} />
            </div>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
        </Wrapper>
    );
}
