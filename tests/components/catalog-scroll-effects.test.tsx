import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
import { scrollEffects, scrollExamples } from "@/components/catalog/scroll-effects";

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

  it("publishes the retained marquee example", () => {
    expect(scrollEffects.map(effect => effect.slug)).toEqual(["draggable-marquee"]);
    scrollEffects.forEach(effect => {
      expect(scrollExamples[effect.slug]).toContain("export default function Demo");
      expect(scrollExamples[effect.slug]).not.toContain("IMPORT");
      expect(scrollExamples[effect.slug]).not.toContain("DATA");
    });
  });
});
