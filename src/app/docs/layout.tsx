import { cache, type ReactNode } from 'react';
import { Layout } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import { DocsWorkspace } from '@/components/docs/docs-workspace';
import { documentationEntries } from '@/content/_meta';
import 'nextra-theme-docs/style.css';
import './docs.css';

const getCachedPageMap = cache(async () => {
    const pageMap = await getPageMap('/docs');
    const order = new Map(documentationEntries.map(([slug], index) => [slug, index]));
    const metadata = pageMap.filter(item => 'data' in item);
    const pages = pageMap.filter(item => 'name' in item);
    return [...metadata, ...pages.toSorted((a, b) =>
        (order.get(a.name) ?? Infinity) - (order.get(b.name) ?? Infinity),
    )];
});

export default async function DocsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="obsidian-docs">
            <Layout
                navbar={null}
                copyPageButton={false}
                pageMap={await getCachedPageMap()}
                search={null}
                footer={<></>}
                editLink={null}
                feedback={{ content: null }}
                darkMode={false}
                sidebar={{ defaultMenuCollapseLevel: 3, toggleButton: false }}
                toc={{ backToTop: null }}
            >
                <DocsWorkspace>{children}</DocsWorkspace>
            </Layout>
        </div>
    );
}
