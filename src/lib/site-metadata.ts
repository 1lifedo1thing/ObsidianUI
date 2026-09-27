import type { Metadata } from "next";
import { r2 } from "@/lib/r2";

export const siteTitle = "ObsidianUI - React & Tailwind CSS Components Library";
export const siteDescription = "ObsidianUI is React component library featuring components,blocks, and landing page templates build with Motion and Tailwind CSS.";

export const docsDescriptions: Record<string, string> = {
  "installation": "Create a Next.js project with TypeScript, Tailwind CSS, ESLint, and App Router for ObsidianUI components.",
  "install-tailwind": "Install and configure Tailwind CSS for ObsidianUI components in a Next.js project.",
  "add-utilities": "Set up the utility functions required to use ObsidianUI components in your React project.",
  "cli": "Install ObsidianUI components with the shadcn CLI and connect coding agents through the MCP server.",
  "hover-img": "Preview images that follow the cursor when visitors hover over titles. Explore the Hover Image React component and copy its source.",
  "v-prism": "Explore v-prism, an interactive glass prism that splits a movable light beam into a spectrum. View its settings and React source.",
  "split-showcase": "Show two interactive partner cards with hover motion and a dotted divider. Preview the Split Showcase React component.",
  "art-gallery": "Explore Art Gallery, a draggable photo grid with lens distortion and an infinite tiled layout.",
  "flip-text": "Preview Flip Text, an animated React component whose characters flip and rotate on hover.",
  "text-stream": "Preview Text reel, a vertical text stream that changes speed and direction as you scroll.",
  "draggable-marquee": "Explore a looping image marquee with drag momentum and keyboard controls for React interfaces.",
};

export function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
  type: "website" | "article" = "website",
): Metadata {
  const image = r2("/og-image.png");

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type,
      title,
      description,
      url: pathname,
      siteName: "ObsidianUI",
      locale: "en_US",
      images: [{ url: image, width: 1917, height: 1078, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@athrix_codes",
      creator: "@athrix_codes",
      images: [{ url: image, width: 1917, height: 1078, alt: title }],
    },
  };
}
