"use client";

import dynamic from "next/dynamic";
import { scrollMarqueeImages, type ScrollSlug } from "./scroll-effects";

const DraggableMarquee = dynamic(() => import("@/components/block/draggable-marquee").then(module => module.DraggableMarquee), { ssr: false });

export function ScrollPreview({ compact }: { slug: ScrollSlug; compact: boolean }) {
  return <div className="relative w-full overflow-hidden bg-[#111111] font-body text-white" style={{ height: compact ? "100%" : "400px", containerType: "size" }}>
    <div className="flex h-full items-center"><DraggableMarquee items={scrollMarqueeImages.map(item => ({ ...item, imageClassName: compact ? "h-[180px] w-[140px] rounded-2xl object-cover" : item.imageClassName }))} speed={1.5} gapClassName="gap-5" /></div>
  </div>;
}
