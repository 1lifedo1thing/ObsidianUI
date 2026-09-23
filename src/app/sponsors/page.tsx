import type { Metadata } from "next";
import SponsorsPage from "@/components/pages/sponsors-page";
import { r2 } from "@/lib/r2";

const title = "Sponsors | ObsidianUI";
const description = "Sponsor ObsidianUI, an open-source React UI library. Explore Platinum ($150/month), Gold ($100/month), and Silver ($50/month), or ask about a custom package.";
const url = "https://www.obsidianui.dev/sponsors";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, types: { "text/markdown": "https://www.obsidianui.dev/markdown/sponsors.md" } },
  openGraph: {
    type: "website", title, description, url, siteName: "ObsidianUI",
    images: [{ url: r2("/og-image.png"), width: 1917, height: 1078, alt: "ObsidianUI — open-source React components" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [r2("/og-image.png")] },
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
