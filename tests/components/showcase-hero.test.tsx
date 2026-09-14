import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ reduced: false as boolean | null, inView: true }));

vi.mock("motion/react", async (importOriginal) => {
  const original = await importOriginal<typeof import("motion/react")>();
  const React = await import("react");
  return {
    ...original,
    useReducedMotion: () => state.reduced,
    useInView: () => state.inView,
    motion: {
      div: React.forwardRef<HTMLDivElement, Record<string, unknown>>(function MotionDiv(props, ref) {
        const visual = new Set(["initial", "animate", "transition"]);
        const native = Object.fromEntries(Object.entries(props).filter(([key]) => !visual.has(key)));
        return React.createElement("div", { ...native, ref });
      }),
    },
  };
});

import { ShowcaseHero } from "@/components/catalog/showcase-hero";

describe("showcase video tour", () => {
  const playing = new Set<HTMLMediaElement>();

  beforeEach(() => {
    state.reduced = false;
    state.inView = true;
    playing.clear();
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      playing.add(this);
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      playing.delete(this);
    });
  });

  afterEach(() => vi.useRealTimers());

  it("plays only the focused gallery recording and follows its documentation link", () => {
    const { container } = render(<ShowcaseHero />);
    const videos = container.querySelectorAll("video");
    expect(videos).toHaveLength(12);
    expect(playing.size).toBe(1);
    expect([...playing][0]).toHaveAttribute("src", "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4");
    expect(screen.queryByRole("button", { name: /(?:pause|play) component tour/i })).not.toBeInTheDocument();
    expect(container.querySelector(".showcase-stage-wrap button")).toBeNull();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/installation");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("target");
    expect(screen.queryByRole("link", { name: "Star on GitHub" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(7000));
    expect(playing.size).toBe(1);
    expect([...playing][0]).toHaveAttribute("src", "https://cdn.obsidianui.dev/demos/horizontal-scroll.mp4");
    expect(screen.getByRole("link", { name: "Explore Horizontal Scroll" })).toHaveAttribute("href", "/docs/horizontal-scroll");
  });

  it("includes the three additional recordings without playback controls or removed components", () => {
    const { container } = render(<ShowcaseHero />);
    const sources = Array.from(container.querySelectorAll("video"), (video) => video.getAttribute("src"));
    expect(sources).toEqual(expect.arrayContaining([
      "https://cdn.obsidianui.dev/demos/horizontal-scroll.mp4",
      "https://cdn.obsidianui.dev/demos/mask-cursor-effect.mp4",
      "https://cdn.obsidianui.dev/demos/glowing-dot-scroll-indicator.mp4",
    ]));
    expect(new Set(sources).size).toBe(12);
    expect(container.querySelector("video[controls]")).toBeNull();
    expect(screen.queryByRole("button", { name: /pause|play/i })).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/animated-faq|animated-tabs|testimonial-swiper|staggered-grid|depth-card-stack|animated-modal|liquid-glass-cursor/i);
  });

  it("visits every component once per tour with one recording playing at a time", () => {
    render(<ShowcaseHero />);
    const visited: string[] = [];
    for (let step = 0; step < 12; step += 1) {
      visited.push(screen.getByRole("link", { name: /^Explore / }).getAttribute("href")!);
      expect(playing.size).toBe(1);
      act(() => vi.advanceTimersByTime(7000));
    }
    expect(new Set(visited).size).toBe(12);
    expect(visited).toEqual(expect.arrayContaining([
      "/docs/folder-preview",
      "/docs/otp-input",
      "/docs/flip-scroll",
      "/docs/magnet-tabs",
      "/docs/apple-spotlight",
      "/docs/masonry-grid",
      "/docs/scroll-effect",
      "/docs/flow-scroll",
      "/docs/circle-menu",
      "/docs/horizontal-scroll",
      "/docs/mask-cursor-effect",
      "/docs/glowing-scroll-indicator",
    ]));
    expect(screen.getByRole("link", { name: "Explore Apple Spotlight" })).toHaveAttribute("href", visited[0]);
    expect(playing.size).toBe(1);
  });

  it("pauses playback and the tour offscreen, then resumes when visible", () => {
    const { rerender } = render(<ShowcaseHero />);
    state.inView = false;
    rerender(<ShowcaseHero />);
    expect(playing.size).toBe(0);
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByRole("link", { name: "Explore Apple Spotlight" })).toBeInTheDocument();
    state.inView = true;
    rerender(<ShowcaseHero />);
    expect(playing.size).toBe(1);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Horizontal Scroll" })).toBeInTheDocument();
  });

  it("keeps rotating while the showcase is hovered or its documentation link is focused", () => {
    const { container } = render(<ShowcaseHero />);
    const stage = container.querySelector(".showcase-stage-wrap")!;
    fireEvent.pointerEnter(stage);
    act(() => vi.advanceTimersByTime(7000));
    const explore = screen.getByRole("link", { name: "Explore Horizontal Scroll" });
    expect(explore).toBeInTheDocument();
    expect(playing.size).toBe(1);

    fireEvent.focus(explore);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Interactive Folder" })).toBeInTheDocument();
  });

  it("does not autoplay or move through videos with reduced motion", () => {
    state.reduced = true;
    render(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(11200));
    expect(playing.size).toBe(0);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Explore Apple Spotlight" })).toBeInTheDocument();
  });

  it("renders the same markup without playback controls before and after the motion preference resolves", () => {
    state.reduced = null;
    const server = renderToString(<ShowcaseHero />);
    state.reduced = false;
    const client = renderToString(<ShowcaseHero />);
    expect(server).toBe(client);
    expect(server).not.toMatch(/(?:Pause|Play) component tour/);
  });
});
