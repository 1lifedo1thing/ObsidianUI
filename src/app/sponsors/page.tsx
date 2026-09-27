import SponsorsPage from "@/components/pages/sponsors-page";
import { createPageMetadata } from "@/lib/site-metadata";

const title = "Sponsors | ObsidianUI";
const description = "Sponsor ObsidianUI, an open-source React UI library. Explore Platinum ($150/month) and Gold ($100/month), or ask about a custom package.";
const url = "https://www.obsidianui.dev/sponsors";

export const metadata = {
  ...createPageMetadata(title, description, "/sponsors"),
  alternates: { canonical: url, types: { "text/markdown": "https://www.obsidianui.dev/markdown/sponsors.md" } },
};

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@type": "WebSite", name: "ObsidianUI", url: "https://www.obsidianui.dev" },
    about: {
      "@type": "Organization", name: "ObsidianUI", url: "https://www.obsidianui.dev",
      email: "jadavatharv2010@gmail.com",
      sponsor: [
        { "@type": "Organization", name: "Vercel", url: "https://vercel.com" },
        { "@type": "Organization", name: "Tracwell", url: "https://tracwell.app" },
      ],
    },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <SponsorsPage />
  </>;
}
