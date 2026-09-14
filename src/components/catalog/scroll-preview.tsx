"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import Image from "next/image";
import { scrollEffects, scrollGalleryImages, scrollMarqueeImages, scrollStackCards, svgMarqueeImages, svgMarqueePath, type ScrollSlug } from "./scroll-effects";

const DraggableMarquee = dynamic(() => import("@/components/block/draggable-marquee").then(module => module.DraggableMarquee), { ssr: false });
const ParallaxGallery = dynamic(() => import("@/components/block/parallax-gallery").then(module => module.ParallaxGallery), { ssr: false });
const ScrollStack = dynamic(() => import("@/components/block/scroll-stack").then(module => module.ScrollStack), { ssr: false });
const SvgPathMarquee = dynamic(() => import("@/components/block/svg-path-marquee").then(module => module.SvgPathMarquee), { ssr: false });
const SvgPixelReveal = dynamic(() => import("@/components/block/svg-pixel-reveal").then(module => module.SvgPixelReveal), { ssr: false });

export function ScrollPreview({ slug, compact }: { slug: ScrollSlug; compact: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const title = scrollEffects.find(effect => effect.slug === slug)?.title ?? "Scroll effect";
  const scrollDriven = slug !== "draggable-marquee";
  return <div ref={scroller} tabIndex={scrollDriven ? 0 : undefined} role="region" aria-label={`${title} preview${scrollDriven ? ". Scroll inside this area." : ""}`} className={`relative w-full overscroll-contain bg-[#111111] font-body text-white outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-ring ${scrollDriven ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"}`} style={{ height: compact ? "100%" : "400px", containerType: "size" }}>
    {slug === "draggable-marquee" && <div className="flex h-full items-center"><DraggableMarquee items={scrollMarqueeImages.map(item => ({ ...item, imageClassName: compact ? "h-[180px] w-[140px] rounded-2xl object-cover" : item.imageClassName }))} speed={1.5} gapClassName="gap-5" /></div>}
    {slug === "parallax-gallery" && <ParallaxGallery images={scrollGalleryImages} scroller={scroller} viewportHeight="100cqh" frameWidth={compact ? 170 : 240} frameHeight={compact ? 210 : 280} thumbnailWidth={compact ? 65 : 90} thumbnailHeight={compact ? 95 : 130} />}
    {slug === "scroll-stack" && <ScrollStack cards={scrollStackCards} bgColor="bg-[#151515]" scroller={scroller} viewportHeight="100cqh" contained />}
    {slug === "svg-path-marquee" && <div className="h-[180cqh]"><div className="sticky top-0 h-[100cqh]"><SvgPathMarquee path={svgMarqueePath} viewBox="0 0 996 330" className="h-full w-full" responsive draggable grabCursor baseVelocity={8} repeat={2} scrollContainer={scroller} slowdownOnHover useScrollVelocity>
      {svgMarqueeImages.map((src, index) => <Image key={src} src={src} alt={`Landscape photograph ${index + 1}`} width={compact ? 170 : 100} height={compact ? 240 : 140} draggable={false} className="h-auto object-cover" />)}
    </SvgPathMarquee></div></div>}
    {slug === "svg-pixel-reveal" && <><div className="flex h-[45cqh] items-center justify-center text-sm text-white/65">Scroll to reveal</div><SvgPixelReveal src="/effects/svg-pixel-reveal/svg-pixel-reveal-img01.png" alt="Landscape photograph" scroller={scroller} start="top 35%" style={{ width: "86%", height: "70cqh", margin: "0 auto", borderRadius: 16, overflow: "hidden" }} /><div className="h-[50cqh]" /></>}
  </div>;
}
