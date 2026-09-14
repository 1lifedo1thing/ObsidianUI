import { type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({ reducedMotion: false, motionProps: vi.fn() }));

vi.mock("motion/react", async () => {
  const React = await import("react");
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, Record<string, unknown>>(function MotionDiv(props, ref) {
        controls.motionProps(props);
        const visualProps = new Set(["initial", "animate", "exit", "transition"]);
        const nativeProps = Object.fromEntries(Object.entries(props).filter(([name]) => !visualProps.has(name)));
        return React.createElement("div", { ...nativeProps, ref });
      }),
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    useReducedMotion: () => controls.reducedMotion,
  };
});

vi.mock("@/components/media/preview-video", () => ({
  PreviewVideo: ({ src, label, showControls }: { src: string; label: string; showControls: boolean }) => (
    <video src={src} aria-label={label} controls={showControls} />
  ),
}));
vi.mock("@/components/catalog/effect-preview", () => ({
  EffectPreview: ({ slug }: { slug: string }) => <div data-effect-preview={slug} />,
}));

import { WeeklyComponentBadge } from "@/components/landing/weekly-component-badge";

describe("weekly component folder", () => {
  beforeEach(() => {
    controls.reducedMotion = false;
    controls.motionProps.mockClear();
  });

  it("loads one video and two live components only while expanded, without images or playback controls", async () => {
    const user = userEvent.setup();
    const { container } = render(<WeeklyComponentBadge />);
    const button = screen.getByRole("button", { name: "New Component every week" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("video")).toBeNull();

    await user.hover(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(container.querySelector("video")).toHaveAttribute("src", "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4");
    expect(container.querySelector("video")).not.toHaveAttribute("controls");
    expect(Array.from(container.querySelectorAll("[data-effect-preview]")).map(node => node.getAttribute("data-effect-preview")))
      .toEqual(["arrow-fill-button", "rectangular-text-reveal"]);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(container.querySelector(".weekly-folder")).toHaveAttribute("inert");

    await user.unhover(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("[data-effect-preview]")).toBeNull();
  });

  it("opens with keyboard focus, exposes preview names, and supports Escape and blur", async () => {
    const user = userEvent.setup();
    render(<><WeeklyComponentBadge /><button>Next control</button></>);
    const button = screen.getByRole("button", { name: "New Component every week" });
    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("listitem").map(item => item.textContent))
      .toEqual(["Apple Spotlight video", "Arrow Fill Button", "Rectangular Text Reveal"]);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.tab();
    expect(screen.getByRole("button", { name: "Next control" })).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on a touch click without depending on hover", () => {
    render(<WeeklyComponentBadge />);
    const button = screen.getByRole("button");
    fireEvent.click(button, { detail: 1 });
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.blur(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps all folder transitions instant for reduced motion", async () => {
    controls.reducedMotion = true;
    const user = userEvent.setup();
    render(<WeeklyComponentBadge />);
    await user.hover(screen.getByRole("button"));
    expect(controls.motionProps.mock.calls.length).toBeGreaterThan(0);
    for (const [props] of controls.motionProps.mock.calls) {
      expect(props.transition.duration).toBe(0);
    }
  });
});
