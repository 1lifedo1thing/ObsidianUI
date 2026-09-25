"use client";

import dynamic from "next/dynamic";
import type { WebglSlug } from "./webgl-effects";

const ArtGallery = dynamic(() => import("@/components/block/art-gallery").then(module => module.ArtGallery));
const VPrism = dynamic(() => import("@/components/block/v-prism").then(module => module.VPrism), { ssr: false });

export function WebglPreview({ slug, compact }: { slug: WebglSlug; compact: boolean }) {
  switch (slug) {
    case "v-prism": return <VPrism />;
    case "art-gallery": return <ArtGallery className="h-full" showHint={!compact} />;
  }
}
