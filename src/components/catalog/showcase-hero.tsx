"use client";
import { r2 } from "@/lib/r2";

// Layout and camera motion adapted from EvilCharts (MIT).
// See THIRD_PARTY_NOTICES.md for the original copyright and license.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, cubicBezier, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Component } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./showcase-hero.css";

type StageCard = {
  slug: string;
  title: string;
  x: number;
  y: number;
  aspect: number;
  video: string;
};

/** Decorative stage videos play only while focused, visible, and motion is allowed. */
function StageVideo({ src, playing }: { src: string; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing && !failed) {
      void video.play().catch(() => { /* Keep a still frame if autoplay is unavailable. */ });
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [playing, failed]);

  return <>
    <video ref={ref} src={src} loop muted playsInline preload="metadata" className="showcase-stage-video" onError={() => setFailed(true)} />
    {failed && <span className="showcase-video-unavailable">Preview unavailable</span>}
  </>;
}

// The same published recordings used by the component gallery.
const CARDS: StageCard[] = [
  {
    slug: "folder-preview", title: "Interactive Folder", x: 40, y: 40, aspect: 1492 / 1266,
    video: "https://cdn.obsidianui.dev/demos/interactive-folder.mp4",
  },
  {
    slug: "otp-input", title: "OTP Input", x: 500, y: -30, aspect: 1492 / 1266,
    video: "https://cdn.obsidianui.dev/demos/otp-input.mp4",
  },
  {
    slug: "flip-scroll", title: "Flip Scroll", x: 960, y: 70, aspect: 2096 / 1620,
    video: "https://cdn.obsidianui.dev/demos/flip-scroll.mp4",
  },
  {
    slug: "magnet-tabs", title: "Magnet Tabs", x: 40, y: 460, aspect: 1492 / 1266,
    video: "https://cdn.obsidianui.dev/demos/magnet-tabs.mp4",
  },
  {
    slug: "apple-spotlight", title: "Apple Spotlight", x: 500, y: 390, aspect: 2372 / 1530,
    video: "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4",
  },
  {
    slug: "masonry-grid", title: "Masonry Grid", x: 960, y: 490, aspect: 2034 / 1252,
    video: "https://cdn.obsidianui.dev/demos/masonry-grid.mp4",
  },
  {
    slug: "scroll-effect", title: "Stack Scroll", x: 40, y: 880, aspect: 2372 / 1524,
    video: "https://cdn.obsidianui.dev/demos/stack-scroll.mp4",
  },
  {
    slug: "flow-scroll", title: "Flow Scroll", x: 500, y: 810, aspect: 2414 / 1636,
    video: "https://cdn.obsidianui.dev/demos/flow-scroll.mp4",
  },
  {
    slug: "circle-menu", title: "Circle Menu", x: 960, y: 910, aspect: 1264 / 964,
    video: "https://cdn.obsidianui.dev/demos/circle-menu.mp4",
  },
  {
    slug: "horizontal-scroll", title: "Horizontal Scroll", x: 40, y: 1300, aspect: 2294 / 1476,
    video: "https://cdn.obsidianui.dev/demos/horizontal-scroll.mp4",
  },
  {
    slug: "mask-cursor-effect", title: "Mask Cursor Effect", x: 500, y: 1230, aspect: 822 / 564,
    video: "https://cdn.obsidianui.dev/demos/mask-cursor-effect.mp4",
  },
  {
    slug: "glowing-scroll-indicator", title: "Glowing Scroll Indicator", x: 960, y: 1330, aspect: 682 / 426,
    video: "https://cdn.obsidianui.dev/demos/glowing-dot-scroll-indicator.mp4",
  },
];

const CARD_WIDTH = 420;
// 14px includes the shell padding and both borders; 42px also includes its title.
const cardHeight = (card: StageCard) => (CARD_WIDTH - 14) / card.aspect + 42;
const START_INDEX = 4;
const TOUR = [4, 9, 0, 10, 8, 11, 2, 6, 1, 7, 3, 5];
const TOUR_INTERVAL_MS = 7000;
const panEase = cubicBezier(0.65, 0, 0.35, 1);
const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));

function ComponentsStage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef({ x: 710, y: 465, scale: 0.72 });
  const flightRef = useRef<ReturnType<typeof animate> | null>(null);
  const settledRef = useRef(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(START_INDEX);
  const reduce = useReducedMotion();
  const inView = useInView(viewportRef, { amount: 0.2 });
  const focus = CARDS[active];

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce !== false || !inView) return;
    const timer = setInterval(() => {
      setActive((current) => TOUR[(TOUR.indexOf(current) + 1) % TOUR.length]);
    }, TOUR_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reduce, inView]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport.width || !viewport.height) return;
    const scale = clamp(0.5, Math.min(viewport.width / 800, viewport.height / 650), 0.92);
    const target = { x: focus.x + CARD_WIDTH / 2, y: focus.y + cardHeight(focus) / 2, scale };
    const paintCamera = (camera: typeof target) => {
      cameraRef.current = camera;
      canvas.style.transform = `translate(${viewport.width / 2 - camera.x * camera.scale}px, ${viewport.height / 2 - camera.y * camera.scale}px) scale(${camera.scale})`;
    };

    flightRef.current?.stop();
    if (!settledRef.current || reduce) {
      paintCamera(target);
      settledRef.current = true;
      return;
    }
    if (!inView) return;

    const from = cameraRef.current;
    const distance = Math.hypot(target.x - from.x, target.y - from.y) * scale;
    if (distance < 1) {
      paintCamera(target);
      return;
    }
    const duration = clamp(1.2, 0.9 + distance / 750, 2.3);
    const zoomDepth = scale * 0.18;
    const flight = animate(0, 1, {
      duration,
      ease: "linear",
      onUpdate: (progress) => {
        const pan = panEase(progress);
        paintCamera({
          x: from.x + (target.x - from.x) * pan,
          y: from.y + (target.y - from.y) * pan,
          scale: from.scale + (scale - from.scale) * pan - zoomDepth * Math.sin(Math.PI * progress) ** 2,
        });
      },
    });
    flightRef.current = flight;
    return () => flight.stop();
  }, [focus, viewport, reduce, inView]);

  return (
    <div className="showcase-stage-wrap">
      <div ref={viewportRef} className="showcase-stage" aria-hidden="true">
        <div ref={canvasRef} className="showcase-canvas">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.slug}
              className={cn("showcase-stage-card", index === active && "showcase-stage-card-active")}
              style={{ left: card.x, top: card.y, width: CARD_WIDTH, height: cardHeight(card) }}
              initial={false}
              animate={{ opacity: index === active ? 1 : 0.35, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.75, ease: "easeInOut" }}
            >
              <div className="showcase-stage-card-title"><Component size={13} /><span>{card.slug}.tsx</span></div>
              <div className="showcase-stage-card-preview"><StageVideo src={card.video} playing={index === active && inView && reduce === false} /></div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="showcase-stage-fade" aria-hidden="true" />
      <div className="showcase-stage-controls">
        <Link href={`/docs/${focus.slug}`} className="showcase-explore-link">Explore {focus.title}<ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

export function ShowcaseHero() {
  return (
    <header className="showcase-hero landing-typography">
      <div className="showcase-hero-copy">
        <div className="showcase-hero-copy-inner">
          <h1 className="showcase-wordmark landing-title"><Image src={r2("/logo/bg-less.png")} alt="" width={40} height={40} priority />ObsidianUI<span className="sr-only"> component showcase</span></h1>
          <p className="showcase-description landing-copy">Animated, interactive components for React. Built with Tailwind CSS and Motion, ready to copy, customize, and ship your next great interface.</p>
          <div className="showcase-hero-actions">
            <Button asChild><a href="#component-gallery">Browse Components<ArrowDown aria-hidden="true" /></a></Button>
            <Button asChild variant="outline"><Link href="/docs/installation">Docs</Link></Button>
          </div>
        </div>
      </div>
      <ComponentsStage />
    </header>
  );
}
