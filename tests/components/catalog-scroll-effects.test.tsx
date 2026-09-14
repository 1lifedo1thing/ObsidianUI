import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => ({
  reduced: false,
  triggers: [] as Array<{ vars: Record<string, unknown>; kill: ReturnType<typeof vi.fn> }>,
  drags: [] as Array<{ kill: ReturnType<typeof vi.fn>; x: number }>,
  ticks: new Set<() => void>(),
  media: new Set<object>(),
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin() {},
    matchMedia: () => {
      const token = {};
      engine.media.add(token);
      let cleanup: undefined | (() => void);
      return {
        add: (_query: string, callback: () => (() => void) | undefined) => {
          if (!engine.reduced) cleanup = callback();
        },
        revert: () => { cleanup?.(); engine.media.delete(token); },
      };
    },
    set() {},
    quickSetter: (element: HTMLElement) => (x: number) => { element.style.transform = `translateX(${x}px)`; },
    to: () => ({ kill: vi.fn() }),
    timeline: ({ scrollTrigger }: { scrollTrigger: Record<string, unknown> }) => {
      engine.triggers.push({ vars: scrollTrigger, kill: vi.fn() });
      return { to() { return this; } };
    },
    ticker: {
      add: (callback: () => void) => engine.ticks.add(callback),
      remove: (callback: () => void) => engine.ticks.delete(callback),
    },
    utils: {
      wrap: (min: number, max: number) => (value: number) => ((value - min) % (max - min) + (max - min)) % (max - min) + min,
      clamp: (min: number, max: number, value: number) => Math.max(min, Math.min(max, value)),
    },
  },
}));

vi.mock("gsap/Draggable", () => ({ default: {
  create: () => {
    const drag = { kill: vi.fn(), x: 0 };
    engine.drags.push(drag);
    return [drag];
  },
} }));

function triggerModule() {
  const ScrollTrigger = {
    create: (vars: Record<string, unknown>) => {
      const trigger = { vars, kill: vi.fn() };
      engine.triggers.push(trigger);
      return trigger;
    },
  };
  return { default: ScrollTrigger, ScrollTrigger };
}
vi.mock("gsap/ScrollTrigger", () => triggerModule());
vi.mock("gsap/dist/ScrollTrigger", () => triggerModule());
vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => engine.reduced,
}));

import { DraggableMarquee } from "@/components/block/draggable-marquee";
import { ParallaxGallery } from "@/components/block/parallax-gallery";
import { ScrollStack } from "@/components/block/scroll-stack";
import { SvgPathMarquee } from "@/components/block/svg-path-marquee";
import { SvgPixelReveal } from "@/components/block/svg-pixel-reveal";
import { scrollEffects, scrollExamples, scrollStackCards } from "@/components/catalog/scroll-effects";

describe("scroll effect containment and lifecycle", () => {
  beforeEach(() => {
    engine.reduced = false;
    engine.triggers = [];
    engine.drags = [];
    engine.ticks.clear();
    engine.media.clear();
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 140, height: 180 } as DOMRect);
  });

  it("keeps marquee movement keyboard-accessible and removes drag instances and ticks in Strict Mode", () => {
    const items = [{ id: 1, src: "/effects/draggable-marquee/p-img-1.jpg", alt: "Landscape" }];
    const { container, unmount } = render(<React.StrictMode><DraggableMarquee items={items} /></React.StrictMode>);
    const region = screen.getByRole("region");
    const track = region.firstElementChild as HTMLElement;
    const initialTransform = track.style.transform;
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(track.style.transform).not.toBe(initialTransform);
    expect(engine.ticks.size).toBe(1);
    expect(container.querySelectorAll('[data-marquee-copy="duplicate"][aria-hidden="true"]')).toHaveLength(2);
    unmount();
    expect(engine.ticks.size).toBe(0);
    expect(engine.media.size).toBe(0);
    engine.drags.forEach(drag => expect(drag.kill).toHaveBeenCalledOnce());
  });

  it("binds independent gallery and pixel reveal triggers to their supplied scroll containers", () => {
    const firstScroller = document.createElement("div");
    const secondScroller = document.createElement("div");
    const { unmount } = render(<>
      <ParallaxGallery images={["/first.jpg", "/second.jpg"]} scroller={{ current: firstScroller }} viewportHeight="400px" />
      <SvgPixelReveal src="/image.png" scroller={secondScroller} />
    </>);
    expect(engine.triggers).toHaveLength(2);
    expect(engine.triggers[0].vars.scroller).toBe(firstScroller);
    expect(engine.triggers[1].vars.scroller).toBe(secondScroller);
    act(() => (engine.triggers[0].vars.onUpdate as (value: { progress: number }) => void)({ progress: 1 }));
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
    unmount();
    engine.triggers.forEach(trigger => expect(trigger.kill).toHaveBeenCalledOnce());
    expect(engine.media.size).toBe(0);
  });

  it("uses the card stack's container for handoff timelines and keeps its source cards in the DOM", () => {
    const scroller = document.createElement("div");
    const { container, unmount } = render(<ScrollStack cards={scrollStackCards} scroller={scroller} viewportHeight="400px" contained />);
    expect(engine.triggers.length).toBeGreaterThan(0);
    engine.triggers.forEach(trigger => expect(trigger.vars.scroller).toBe(scroller));
    expect(container.querySelectorAll(".scroll-stack-card")).toHaveLength(3);
    expect(container.querySelector("section")).toHaveStyle({ "--scroll-stack-viewport": "400px" });
    unmount();
    expect(engine.media.size).toBe(0);
  });

  it("keeps reduced-motion gallery images available and starts no GSAP loops or triggers", () => {
    engine.reduced = true;
    const { unmount } = render(<>
      <DraggableMarquee items={[{ src: "/image.jpg" }]} />
      <ParallaxGallery images={["/first.jpg", "/second.jpg"]} />
      <ScrollStack cards={scrollStackCards} />
      <SvgPixelReveal src="/image.png" />
    </>);
    expect(screen.getAllByAltText(/Gallery photograph/)).toHaveLength(2);
    expect(engine.ticks.size).toBe(0);
    expect(engine.triggers).toHaveLength(0);
    unmount();
    expect(engine.media.size).toBe(0);
  });

  it("keeps SVG path IDs stable and accepts changing item counts and keyboard movement", async () => {
    engine.reduced = true;
    const path = "M0 50 L200 50";
    const { container, rerender } = render(<SvgPathMarquee path={path} draggable repeat={2}><span>One</span></SvgPathMarquee>);
    const id = container.querySelector("path")!.id;
    const region = screen.getByRole("region");
    const item = container.querySelector<HTMLElement>('[aria-hidden="false"]')!;
    fireEvent.keyDown(region, { key: "ArrowRight" });
    await waitFor(() => expect(item.style.offsetDistance).toBe("5%"));
    rerender(<SvgPathMarquee path={path} draggable repeat={2}><span>One</span><span>Two</span></SvgPathMarquee>);
    expect(container.querySelector("path")!.id).toBe(id);
    expect(container.querySelectorAll('[aria-hidden="false"]')).toHaveLength(2);
  });

  it("publishes exactly the selected five complete examples", () => {
    expect(scrollEffects.map(effect => effect.slug)).toEqual(["draggable-marquee", "parallax-gallery", "scroll-stack", "svg-path-marquee", "svg-pixel-reveal"]);
    scrollEffects.forEach(effect => {
      expect(scrollExamples[effect.slug]).toContain("export default function Demo");
      expect(scrollExamples[effect.slug]).not.toContain("IMPORT");
      expect(scrollExamples[effect.slug]).not.toContain("DATA");
    });
  });
});
