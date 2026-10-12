import TemplatesPage, { templates } from "@/components/pages/templates-page";
import { createPageMetadata, siteOrigin } from "@/lib/site-metadata";

const title = "Landing Page Templates | ObsidianUI";
const description = "Explore ObsidianUI landing page templates built with React, Motion, and Tailwind CSS, with live previews and source links.";
const url = `${siteOrigin}/templates`;

export const metadata = createPageMetadata(title, description, "/templates");

export default function Page() {
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
      itemListElement: templates.map((template, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteOrigin}${template.href}`,
        name: template.title,
        image: template.poster,
      })),
    },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <TemplatesPage />
  </>;
}
