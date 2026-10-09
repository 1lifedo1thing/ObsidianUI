import PromptsPage from "@/components/pages/prompts/prompts-page";
import { prompts } from "@/lib/prompts";
import { createPageMetadata } from "@/lib/site-metadata";

const title = "AI Coding Prompts for React UI | ObsidianUI";
const description = "Copy-ready prompts for coding agents: launch videos, components, dashboards, motion, accessibility, docs, and SEO. Open in Factory, ChatGPT, Claude, and more.";
const url = "https://www.obsidianui.dev/prompts";

export const metadata = {
  ...createPageMetadata(title, description, "/prompts"),
  alternates: { canonical: url, types: { "text/markdown": "https://www.obsidianui.dev/markdown/prompts.md" } },
};

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@type": "WebSite", name: "ObsidianUI", url: "https://www.obsidianui.dev" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: prompts.map((prompt, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${url}/${prompt.slug}`,
        name: prompt.title,
      })),
    },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <PromptsPage />
  </>;
}
