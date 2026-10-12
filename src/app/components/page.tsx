import { ComponentsGrid } from "@/components/catalog/components-grid";
import { ShowcaseHero } from "@/components/catalog/showcase-hero";
import { documentationEntries } from "@/content/_meta";
import { createPageMetadata, docsDescriptions, siteOrigin } from "@/lib/site-metadata";

const title = "React Components | ObsidianUI";
const description = "Browse interactive React components built with Motion and Tailwind CSS. Preview each component, explore its details, and copy the source.";
const url = `${siteOrigin}/components`;

export const metadata = createPageMetadata(title, description, "/components");

/** Every docs page listed after the Components or Blocks separator in the sidebar. */
function catalogItems() {
    let inCatalog = false;
    return documentationEntries.flatMap(([slug, entry]) => {
        if (typeof entry === "object" && "type" in entry && entry.type === "separator") {
            inCatalog = entry.title === "Components" || entry.title === "Blocks";
            return [];
        }
        return inCatalog && typeof entry === "string" ? [{ slug, name: entry }] : [];
    });
}

export default function ComponentsPage() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        mainEntity: {
            "@type": "ItemList",
            itemListElement: catalogItems().map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${siteOrigin}/docs/${item.slug}`,
                name: item.name,
                ...(docsDescriptions[item.slug] && { description: docsDescriptions[item.slug] }),
            })),
        },
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
            <main id="main-content">
                <ShowcaseHero />
                <section id="component-gallery" aria-labelledby="component-gallery-title" className="showcase-gallery mx-auto max-w-[1520px] scroll-mt-28 px-5 py-14 sm:px-8 lg:px-10">
                    <div className="showcase-gallery-heading">
                        <h2 id="component-gallery-title">Components worth a closer look</h2>
                        <p>Play with the previews, explore the details, and make each interaction your own.</p>
                    </div>
                    <ComponentsGrid />
                </section>
            </main>
        </div>
    );
}
