import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const previewInteraction = vi.hoisted(() => vi.fn());

vi.mock("gsap", () => ({ default: { registerPlugin: vi.fn() } }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));
vi.mock("motion/react", async () => {
  const React = await import("react");
  const animationProps = new Set(["initial", "whileInView", "viewport", "transition"]);
  return {
    useReducedMotion: () => false,
    motion: {
      div: React.forwardRef<HTMLDivElement, Record<string, unknown>>(function MotionDiv(props, ref) {
        return React.createElement("div", {
          ...Object.fromEntries(Object.entries(props).filter(([name]) => !animationProps.has(name))),
          ref,
        });
      }),
    },
  };
});

// Keep real media behavior; replace the canvas/GSAP effect runtime with an
// interactive surface so the card's navigation cannot swallow preview input.
vi.mock("@/components/catalog/effect-preview", () => ({
  EffectPreview: ({ slug, compact }: { slug: string; compact: boolean }) => (
    <div data-effect-preview={slug} data-compact={compact}>
      <button type="button" onClick={() => previewInteraction(slug)}>Try {slug}</button>
    </div>
  ),
}));

import { VideoShowcaseGrid } from "@/components/landing/video-showcase-grid";

describe("landing featured components", () => {
  let intersections: IntersectionObserverCallback[];

  beforeEach(async () => {
    intersections = [];
    previewInteraction.mockClear();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { intersections.push(callback); }
      observe() {}
      disconnect() {}
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const gsap = (await import("gsap")).default;
    Object.assign(gsap, { context: vi.fn(() => ({ revert: vi.fn() })) });
  });

  it("keeps the two retained videos free of custom and native playback controls", () => {
    const { container } = render(<VideoShowcaseGrid />);
    const videos = [...container.querySelectorAll("video")];
    expect(videos.map(video => video.src)).toEqual([
      "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4",
      "https://cdn.obsidianui.dev/demos/circle-menu.mp4",
    ]);
    for (const video of videos) {
      expect(video.controls).toBe(false);
      expect(video.loop).toBe(true);
      expect(video.muted).toBe(true);
    }
    expect(screen.queryByRole("button", { name: /^(Play|Pause) / })).not.toBeInTheDocument();

    act(() => intersections.forEach(callback => callback(
      [{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver,
    )));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("button", { name: /^(Play|Pause) / })).not.toBeInTheDocument();
  });

  it("replaces the older two cards with compact new effects and valid documentation destinations", () => {
    const { container } = render(<VideoShowcaseGrid />);
    const section = screen.getByRole("region", { name: "Featured Components" });
    expect(within(section).getAllByRole("article")).toHaveLength(4);
    for (const [title, slug] of [
      ["Apple Spotlight", "apple-spotlight"],
      ["Circle Menu", "circle-menu"],
      ["Magnetic Image Trail", "magnetic-image-trail"],
      ["Fractal Glass", "fractal-glass"],
    ]) {
      expect(within(section).getByRole("link", { name: title })).toHaveAttribute("href", `/docs/${slug}`);
    }
    expect(container.querySelectorAll('[data-effect-preview][data-compact="true"]')).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Flip Scroll" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Photo Gallery" })).not.toBeInTheDocument();
  });

  it("keeps live preview interactions outside the documentation links", async () => {
    const user = userEvent.setup();
    render(<VideoShowcaseGrid />);
    for (const slug of ["magnetic-image-trail", "fractal-glass"]) {
      const preview = screen.getByRole("button", { name: `Try ${slug}` });
      expect(preview.closest("a")).toBeNull();
      await user.click(preview);
      expect(previewInteraction).toHaveBeenCalledWith(slug);
    }
  });
});
