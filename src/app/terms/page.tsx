import TermsPage from "@/components/pages/terms-page";
import { createPageMetadata, siteOrigin } from "@/lib/site-metadata";
import { termsUpdated } from "@/lib/terms";

const title = "Terms of Service | ObsidianUI";
const description = "The terms for using ObsidianUI and its MIT-licensed components, and for monthly sponsorships: billing through Dodo Payments, no refunds, and how to cancel.";
const url = `${siteOrigin}/terms`;

export const metadata = createPageMetadata(title, description, "/terms");

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    dateModified: termsUpdated.iso,
    isPartOf: { "@type": "WebSite", name: "ObsidianUI", url: siteOrigin },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <TermsPage />
  </>;
}
