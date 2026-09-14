import type { Metadata } from "next";
import { ComponentsGrid } from "@/components/catalog/components-grid";
import { ShowcaseHero } from "@/components/catalog/showcase-hero";

export const metadata: Metadata = {
    title: "React UI Components | ObsidianUI",
    description: "Browse premium React components with Tailwind CSS and Motion. Copy-paste ready, fully customizable UI components for your next project.",
    openGraph: {
        title: "React UI Components | ObsidianUI",
        description: "Browse premium React components with Tailwind CSS and Motion.",
        url: "https://www.obsidianui.dev/components",
        siteName: "ObsidianUI",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "https://www.obsidianui.dev/og-image.png",
                secureUrl: "https://www.obsidianui.dev/og-image.png",
                width: 1917,
                height: 1078,
                type: "image/png",
                alt: "ObsidianUI - React UI Components",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "React UI Components | ObsidianUI",
        description: "Browse premium React components with Tailwind CSS and Motion.",
        site: "@athrix_codes",
        creator: "@athrix_codes",
        images: [
            {
                url: "https://www.obsidianui.dev/og-image.png",
                width: 1917,
                height: 1078,
                alt: "ObsidianUI - React UI Components",
            },
        ],
    },
    alternates: {
        canonical: "https://www.obsidianui.dev/components",
    },
};

export default function ComponentsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main id="main-content">
                <ShowcaseHero />
                <section id="component-gallery" aria-labelledby="component-gallery-title" className="showcase-gallery mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6">
                    <div className="showcase-gallery-heading">
                        <h2 id="component-gallery-title">Explore the components</h2>
                        <p>Find your next detail. Preview it, copy the code, and make it yours.</p>
                    </div>
                    <ComponentsGrid />
                </section>
            </main>
        </div>
    );
}
