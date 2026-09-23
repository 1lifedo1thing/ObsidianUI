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

vi.mock("@/components/catalog/effect-preview", () => ({
  EffectPreview: ({ slug, compact }: { slug: string; compact?: boolean }) => (
    <div data-effect-preview={slug} data-compact={compact} />
  ),
}));

import { ShowcaseHero } from "@/components/catalog/showcase-hero";

describe("showcase component tour", () => {
  beforeEach(() => {
    state.reduced = false;
    state.inView = true;
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("focuses the initial card and follows its documentation link", () => {
    const { container } = render(<ShowcaseHero />);
    const previews = container.querySelectorAll("[data-effect-preview]");
    expect(previews).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /(?:pause|play) component tour/i })).not.toBeInTheDocument();
    expect(container.querySelector(".showcase-stage-wrap button")).toBeNull();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/installation");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("target");
    expect(screen.queryByRole("link", { name: "Star on GitHub" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Draggable Marquee" })).toHaveAttribute("href", "/docs/draggable-marquee");
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Art Gallery" })).toHaveAttribute("href", "/docs/art-gallery");
  });

  it("includes all three retained effect cards", () => {
    const { container } = render(<ShowcaseHero />);
    const slugs = Array.from(container.querySelectorAll("[data-effect-preview]"), (node) => node.getAttribute("data-effect-preview"));
    expect(slugs).toEqual(expect.arrayContaining([
      "draggable-marquee",
      "art-gallery",
      "text-stream",
    ]));
    expect(new Set(slugs).size).toBe(3);
    expect(container.textContent).not.toMatch(/apple-spotlight|circle-menu|otp-input|folder-preview|masonry-grid|scroll-effect/i);
  });

  it("visits every component once per tour", () => {
    render(<ShowcaseHero />);
    const visited: string[] = [];
    for (let step = 0; step < 3; step += 1) {
      visited.push(screen.getByRole("link", { name: /^Explore / }).getAttribute("href")!);
      act(() => vi.advanceTimersByTime(7000));
    }
    expect(new Set(visited).size).toBe(3);
    expect(visited).toEqual(expect.arrayContaining([
      "/docs/draggable-marquee",
      "/docs/art-gallery",
      "/docs/text-stream",
    ]));
    expect(screen.getByRole("link", { name: "Explore Draggable Marquee" })).toHaveAttribute("href", visited[0]);
  });

  it("pauses the tour offscreen, then resumes when visible", () => {
    const { rerender } = render(<ShowcaseHero />);
    state.inView = false;
    rerender(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByRole("link", { name: "Explore Draggable Marquee" })).toBeInTheDocument();
    state.inView = true;
    rerender(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Art Gallery" })).toBeInTheDocument();
  });

  it("keeps rotating while the showcase is hovered or its documentation link is focused", () => {
    const { container } = render(<ShowcaseHero />);
    const stage = container.querySelector(".showcase-stage-wrap")!;
    fireEvent.pointerEnter(stage);
    act(() => vi.advanceTimersByTime(7000));
    const explore = screen.getByRole("link", { name: "Explore Art Gallery" });
    expect(explore).toBeInTheDocument();

    fireEvent.focus(explore);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Text reel" })).toBeInTheDocument();
  });

  it("does not advance through cards with reduced motion", () => {
    state.reduced = true;
    render(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(11200));
    expect(screen.getByRole("link", { name: "Explore Draggable Marquee" })).toBeInTheDocument();
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
