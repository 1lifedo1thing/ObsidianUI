import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromptDetailPage from "@/components/pages/prompts/prompt-detail-page";
import { getPrompt, prompts } from "@/lib/prompts";
import { createPageMetadata } from "@/lib/site-metadata";

type PageProps = { params: Promise<{ slug: string }> };

const origin = "https://www.obsidianui.dev";

export const dynamicParams = false;

export function generateStaticParams() {
  return prompts.map(prompt => ({ slug: prompt.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const prompt = getPrompt((await params).slug);
  if (!prompt) return {};
  const pathname = `/prompts/${prompt.slug}`;
  const base = createPageMetadata(`${prompt.title} | ObsidianUI Prompts`, prompt.summary, pathname, "article");
  const image = prompt.cover.image ? { url: `${origin}${prompt.cover.image}`, width: 2048, height: 1146, alt: prompt.title } : undefined;
  return {
    ...base,
    ...(image ? {
      openGraph: { ...base.openGraph, images: [image] },
      twitter: { ...base.twitter, images: [image.url] },
    } : {}),
    alternates: { canonical: `${origin}${pathname}`, types: { "text/markdown": `${origin}/markdown${pathname}.md` } },
  };
}

export default async function Page({ params }: PageProps) {
  const prompt = getPrompt((await params).slug);
  if (!prompt) notFound();
  const url = `${origin}/prompts/${prompt.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: prompt.title,
        description: prompt.summary,
        url,
        datePublished: prompt.date,
        articleSection: prompt.category,
        author: { "@type": prompt.author === "Atharv" ? "Person" : "Organization", name: prompt.author },
        publisher: { "@type": "Organization", name: "ObsidianUI", url: origin },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Prompts", item: `${origin}/prompts` },
          { "@type": "ListItem", position: 2, name: prompt.title, item: url },
        ],
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <PromptDetailPage prompt={prompt} />
  </>;
}
