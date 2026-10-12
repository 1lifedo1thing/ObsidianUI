import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | ObsidianUI",
  description: "This ObsidianUI page does not exist. Browse the component library or documentation instead.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content" className="landing-typography mx-auto max-w-3xl px-6 py-24">
      <h1 className="landing-title text-4xl font-medium">Page not found</h1>
      <p className="landing-copy mt-5 text-base">This ObsidianUI page does not exist. Start with the component library or documentation.</p>
      <ul className="mt-8 space-y-4 text-base">
        <li><Link className="underline underline-offset-4" href="/components">Browse components</Link></li>
        <li><Link className="underline underline-offset-4" href="/docs/installation">Documentation</Link></li>
        <li><Link className="underline underline-offset-4" href="/llms.txt">AI agent index</Link></li>
        <li><Link className="underline underline-offset-4" href="/sitemap.xml">Sitemap</Link></li>
      </ul>
    </main>
  );
}
