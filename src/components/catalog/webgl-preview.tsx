"use client";

import dynamic from "next/dynamic";
import type { WebglSlug } from "./webgl-effects";

const BookFlip = dynamic(() => import("@/components/block/book-flip").then(module => module.BookFlip));
const CurvedPlane = dynamic(() => import("@/components/block/curved-plane").then(module => module.CurvedPlane));
const FractalGlass = dynamic(() => import("@/components/block/fractal-glass").then(module => module.FractalGlass));
const GridLift = dynamic(() => import("@/components/block/grid-lift").then(module => module.GridLift));
const InteractiveHoverSlider = dynamic(() => import("@/components/block/interactive-hover-slider").then(module => module.InteractiveHoverSlider));
const ArtGallery = dynamic(() => import("@/components/block/art-gallery").then(module => module.ArtGallery));

const compactBookCamera = { mobile: 2.7, desktop: 2.7 };

export function WebglPreview({ slug, compact }: { slug: WebglSlug; compact: boolean }) {
  switch (slug) {
    case "book-flip": return <BookFlip pageColors={compact ? ["#1e1b4b", "#7c3aed", "#0ea5e9", "#10b981"] : undefined} className="h-full" showUI={!compact} cameraDistance={compact ? compactBookCamera : undefined} />;
    case "curved-plane": return <CurvedPlane className="h-full" />;
    case "fractal-glass": return <FractalGlass className="h-full" />;
    case "grid-lift": return <GridLift className="h-full" />;
    case "interactive-hover-slider": return <InteractiveHoverSlider className="h-full" compact={compact} />;
    case "art-gallery": return <ArtGallery className="h-full" showHint={!compact} />;
  }
}
