"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LoaderGooeyBlobs } from "@/components/ui/loaders-gooey-blobs";
import { newEffects, type NewEffectSlug } from "./new-effects";

const TextStream = dynamic(() => import("@/components/block/text-stream").then(module => module.TextStream));

import { scrollEffects } from "./scroll-effects";
const ScrollPreview = dynamic(() => import("./scroll-preview").then(module => module.ScrollPreview));
import { webglEffects } from "./webgl-effects";
const WebglPreview = dynamic(() => import("./webgl-preview").then(module => module.WebglPreview));


function PreviewLoadGate({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
    const frame = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const root = frame.current;
        if (!root) return;
        let cancelled = false;
        const isReady = () => {
            const images = [...root.querySelectorAll("img")];
            const videos = [...root.querySelectorAll("video")];
            const pendingImages = images.some(image => !image.complete);
            const pendingVideos = videos.some(video => video.readyState < 2);
            return !pendingImages && !pendingVideos;
        };
        const tick = () => {
            if (!cancelled && isReady()) setReady(true);
        };
        const interval = window.setInterval(tick, 120);
        const timeout = window.setTimeout(() => { if (!cancelled) setReady(true); }, 5000);
        tick();
        return () => {
            cancelled = true;
            window.clearInterval(interval);
            window.clearTimeout(timeout);
        };
    }, []);

    return (
        <div ref={frame} className="relative h-full w-full">
            <div className={cn("h-full w-full", !ready && "invisible")}>{children}</div>
            {!ready ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted text-foreground">
                    <LoaderGooeyBlobs size={compact ? 16 : 20} />
                </div>
            ) : null}
        </div>
    );
}

function Effect({ slug, compact }: { slug: NewEffectSlug; compact: boolean }) {
    if (scrollEffects.some(effect => effect.slug === slug)) return <ScrollPreview slug={slug as (typeof scrollEffects)[number]["slug"]} compact={compact} />;
    if (webglEffects.some(effect => effect.slug === slug)) return <WebglPreview slug={slug as (typeof webglEffects)[number]["slug"]} compact={compact} />;
    switch (slug) {
        case "text-stream":
            return <div className="h-full bg-background p-6 text-foreground"><TextStream items={["Create", "Explore", "Build", "Ship"]} prefix="Let's" height="100%" fontSize={compact ? "1.5rem" : "2.25rem"} /></div>;
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
        {visible || hasBeenVisible ? <PreviewLoadGate compact={compact}><Effect slug={slug} compact={compact} /></PreviewLoadGate> : (
            <div className="flex h-full items-center justify-center text-foreground">
                <LoaderGooeyBlobs size={compact ? 16 : 20} />
            </div>
        )}
    </div>;
}
