"use client";

import dynamic from "next/dynamic";
import type { CursorSlug } from "./cursor-effects";

const ButterflyTrailCursor = dynamic(() => import("@/components/block/butterfly-trail-cursor").then(module => module.ButterflyTrailCursor), { ssr: false });
const ColorfulCursorAura = dynamic(() => import("@/components/block/colorful-cursor-aura").then(module => module.ColorfulCursorAura));
const InteractiveArrows = dynamic(() => import("@/components/block/interactive-arrows").then(module => module.InteractiveArrows));
const RopeCursor = dynamic(() => import("@/components/block/rope-cursor").then(module => module.RopeCursor));

export function CursorPreview({ slug, compact }: { slug: CursorSlug; compact: boolean }) {
  switch (slug) {
    case "butterfly-trail-cursor": return <ButterflyTrailCursor height="100%" text={compact ? "In flight." : "ObsidianUI, in flight."} />;
    case "colorful-cursor-aura": return <ColorfulCursorAura height="100%" text="ObsidianUI, in full color." />;
    case "interactive-arrows": return <InteractiveArrows height="100%" showControls={!compact} />;
    case "rope-cursor": return <RopeCursor height="100%" ropeColor="#d0b88c" ropeWidth={3} className="bg-[#151714]"><p className="pointer-events-none grid h-full place-items-center p-8 text-center font-serif text-[clamp(22px,4cqw,44px)] text-[#d0b88c]">Follow your curiosity.</p></RopeCursor>;
  }
}
