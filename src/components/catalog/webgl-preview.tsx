"use client";

import dynamic from "next/dynamic";
import type { WebglSlug } from "./webgl-effects";

const ArtGallery = dynamic(() => import("@/components/block/art-gallery").then(module => module.ArtGallery));

export function WebglPreview({ slug, compact }: { slug: WebglSlug; compact: boolean }) {
  switch (slug) {
    case "art-gallery": return <ArtGallery className="h-full" showHint={!compact} />;
  }
}
