import { ComponentsGrid } from "@/components/catalog/components-grid";
import { ShowcaseHero } from "@/components/catalog/showcase-hero";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
    "React Components | ObsidianUI",
    "Browse interactive React components built with Motion and Tailwind CSS. Preview each component, explore its details, and copy the source.",
    "/components",
);

export default function ComponentsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
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
