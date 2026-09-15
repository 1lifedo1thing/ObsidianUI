"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { newEffects, type NewEffectSlug } from "./new-effects";

const compactMagneticImages = [
    "https://cdn-athrix.milliondollarinternet.lol/effects/magnetic-image-trail/magnetic-image-trail-distortion.jpg",
    "https://cdn-athrix.milliondollarinternet.lol/effects/magnetic-image-trail/magnetic-image-trail-img01.webp",
    "https://cdn-athrix.milliondollarinternet.lol/effects/magnetic-image-trail/magnetic-image-trail-img02.webp",
    "https://cdn-athrix.milliondollarinternet.lol/effects/magnetic-image-trail/magnetic-image-trail-img03.webp",
    "https://cdn-athrix.milliondollarinternet.lol/effects/magnetic-image-trail/magnetic-image-trail-img04.png",
];

const MagneticImageTrail = dynamic(() => import("@/components/block/magnetic-image-trail").then(module => module.MagneticImageTrail));
const ArrowFillButton = dynamic(() => import("@/components/block/arrow-fill-button").then(module => module.ArrowFillButton));
const DottedGrid = dynamic(() => import("@/components/block/dotted-grid").then(module => module.DottedGrid));
const InteractiveBlurReveal = dynamic(() => import("@/components/block/interactive-blur-reveal").then(module => module.InteractiveBlurReveal));
const TextFillAnimation = dynamic(() => import("@/components/block/text-fill-animation").then(module => module.TextFillAnimation));
const RectangularTextReveal = dynamic(() => import("@/components/block/rectangular-text-reveal").then(module => module.RectangularTextReveal));
const TextStream = dynamic(() => import("@/components/block/text-stream").then(module => module.TextStream));
const DitherCanvas = dynamic(() => import("@/components/block/dither-canvas").then(module => module.DitherCanvas));

import { scrollEffects } from "./scroll-effects";
const ScrollPreview = dynamic(() => import("./scroll-preview").then(module => module.ScrollPreview));
import { cursorEffects } from "./cursor-effects";
const CursorPreview = dynamic(() => import("./cursor-preview").then(module => module.CursorPreview));
import { webglEffects } from "./webgl-effects";
const WebglPreview = dynamic(() => import("./webgl-preview").then(module => module.WebglPreview));

function Effect({ slug, compact }: { slug: NewEffectSlug; compact: boolean }) {
    const scroller = useRef<HTMLDivElement>(null);
    if (scrollEffects.some(effect => effect.slug === slug)) return <ScrollPreview slug={slug as (typeof scrollEffects)[number]["slug"]} compact={compact} />;
    if (cursorEffects.some(effect => effect.slug === slug)) return <CursorPreview slug={slug as (typeof cursorEffects)[number]["slug"]} compact={compact} />;
    if (webglEffects.some(effect => effect.slug === slug)) return <WebglPreview slug={slug as (typeof webglEffects)[number]["slug"]} compact={compact} />;
    switch (slug) {
        case "magnetic-image-trail":
            return <MagneticImageTrail images={compactMagneticImages} height="100%" className="h-full w-full" />;
        case "arrow-fill-button":
            return <div className="flex h-full items-center justify-center bg-background p-6"><ArrowFillButton href="/components#component-gallery">Explore ObsidianUI</ArrowFillButton></div>;
        case "dotted-grid":
            return <DottedGrid className="h-full w-full" />;
        case "interactive-blur-reveal":
            return <InteractiveBlurReveal className="h-full w-full" />;
        case "text-fill-animation":
            return <div ref={scroller} tabIndex={0} aria-label="Scroll to preview the text fill" className="h-full overflow-y-auto overscroll-contain rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
                <TextFillAnimation scroller={scroller} height="850px" viewportHeight={compact ? "240px" : "400px"} showDetails={false} text="Make something worth remembering. Build your next idea with ObsidianUI." textSize="clamp(1.6rem, 5cqw, 2.5rem)" mobileTextSize="clamp(1.6rem, 5cqw, 2.5rem)" tabletTextSize="clamp(1.6rem, 5cqw, 2.5rem)" />
            </div>;
        case "rectangular-text-reveal":
            return <div className="flex h-full items-center justify-center bg-background p-8">
                <RectangularTextReveal className="font-heading text-3xl font-normal leading-tight text-foreground" overlayColor="var(--background)">Design less.<br />Ship better.</RectangularTextReveal>
            </div>;
        case "text-stream":
            return <div className="h-full bg-background p-6 text-foreground"><TextStream items={["Create", "Explore", "Build", "Ship"]} prefix="Let’s" height="100%" fontSize={compact ? "1.5rem" : "2.25rem"} /></div>;
        case "dither-canvas":
            return <DitherCanvas className="h-full w-full" />;
    }
}

/** Mount expensive canvas previews only while their own card is in view. */
export function EffectPreview({ slug, compact = false }: { slug: NewEffectSlug; compact?: boolean }) {
    const frame = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const effect = newEffects.find(effect => effect.slug === slug)!;

    useEffect(() => {
        const element = frame.current;
        if (!element) return;
        if (typeof IntersectionObserver === "undefined") {
            const id = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(id);
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                setHasBeenVisible(true);
            }
        }, { rootMargin: "100px" });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return <div ref={frame} data-effect-preview={slug} className={cn("relative isolate w-full min-w-0 overflow-hidden rounded-lg bg-muted font-body [container-type:inline-size] [&_*]:[scrollbar-width:thin] [&_*]:[scrollbar-color:var(--border)_transparent]", compact ? "h-full" : "h-[400px]")} aria-label={`${effect.title} interactive preview`}>
        {visible || hasBeenVisible ? <Effect slug={slug} compact={compact} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{effect.title}</div>}
    </div>;
}
