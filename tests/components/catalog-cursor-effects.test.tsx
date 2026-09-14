import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const motion = vi.hoisted(() => ({ reduced: false }));
const animation = vi.hoisted(() => ({
  to: vi.fn((target: Record<string, unknown>, values: Record<string, unknown>) => {
    if (!Array.isArray(target)) {
      if (typeof values.x === "number") target.x = values.x;
      if (typeof values.y === "number") target.y = values.y;
    }
  }),
  killTweensOf: vi.fn(),
  registerPlugin: vi.fn(),
  set: vi.fn(),
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => motion.reduced }));
vi.mock("gsap", () => ({ default: animation, gsap: animation }));

import { ColorfulCursorAura } from "@/components/block/colorful-cursor-aura";
import { InteractiveArrows } from "@/components/block/interactive-arrows";
import { RopeCursor } from "@/components/block/rope-cursor";

describe("new cursor effects", () => {
  let frames: Map<number, FrameRequestCallback>;
  let disconnected: ReturnType<typeof vi.fn<() => void>>;
  let context: Record<string, ReturnType<typeof vi.fn<(...args: unknown[]) => void>>>;

  beforeEach(() => {
    motion.reduced = false;
    vi.clearAllMocks();
    frames = new Map();
    disconnected = vi.fn<() => void>();
    let frameId = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(420);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
    vi.stubGlobal("ResizeObserver", class {
      observesCanvas = false;
      observe(element: Element) { this.observesCanvas = element.querySelector("canvas") !== null; }
      unobserve() {}
      disconnect() { if (this.observesCanvas) disconnected(); }
    });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    context = Object.fromEntries(["save", "restore", "translate", "rotate", "scale", "beginPath", "moveTo", "lineTo", "stroke", "fill", "arc", "clearRect"].map(name => [name, vi.fn<(...args: unknown[]) => void>()]));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
  });

  afterEach(() => vi.unstubAllGlobals());

  const step = (frames: Map<number, FrameRequestCallback>) => {
    const next = [...frames.entries()][0];
    if (!next) return;
    frames.delete(next[0]);
    act(() => next[1](100));
  };

  it("switches all original arrow variants with a single local canvas and cleans the previous loop", async () => {
    const { container, unmount } = render(<InteractiveArrows showControls />);
    for (const label of ["Responsive arrows", "Opacity", "Smooth arrows", "Playful arrows", "Lines", "Points"]) {
      fireEvent.keyDown(screen.getByRole("combobox", { name: "Arrow behavior" }), { key: "ArrowDown" });
      fireEvent.click(await screen.findByRole("option", { name: label }));
      expect(screen.getByRole("combobox", { name: "Arrow behavior" })).toHaveTextContent(label);
      expect(container.querySelectorAll("canvas")).toHaveLength(1);
      expect(frames.size).toBe(1);
      step(frames);
      expect(frames.size).toBe(1);
      const canvas = container.querySelector("canvas")!;
      expect(canvas.width).toBe(420);
      expect(canvas.height).toBe(300);
    }
    unmount();
    expect(frames.size).toBe(0);
    expect(disconnected).toHaveBeenCalledTimes(6);
  });

  it("places accessible controls below the canvas and closes their menu with Escape", async () => {
    const { container } = render(<InteractiveArrows showControls />);
    const stage = container.querySelector("[data-arrow-stage]")!;
    const controls = container.querySelector("[data-arrow-controls]")!;
    const trigger = screen.getByRole("combobox", { name: "Arrow behavior" });
    expect(stage.nextElementSibling).toBe(controls);
    expect(stage).not.toContainElement(trigger);
    expect(trigger.tagName).toBe("BUTTON");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const listbox = await screen.findByRole("listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(listbox).toHaveClass("motion-reduce:animate-none");
    fireEvent.keyDown(listbox, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("keeps arrow patterns static and preserves rope content when reduced motion is requested", () => {
    motion.reduced = true;
    const { unmount } = render(<><InteractiveArrows /><RopeCursor>Readable content</RopeCursor></>);
    expect(context.stroke).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    expect(screen.getByText("Readable content")).toBeVisible();
    unmount();
  });

  it("uses local rope coordinates and ignores pointer activity outside its surface", () => {
    const { container, unmount } = render(<RopeCursor>Follow</RopeCursor>);
    const surface = container.firstElementChild as HTMLElement;
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({ left: 100, top: 50 } as DOMRect);
    fireEvent.mouseMove(window, { clientX: 800, clientY: 600 });
    step(frames);
    expect(animation.to).not.toHaveBeenCalled();
    fireEvent.mouseMove(surface, { clientX: 140, clientY: 80 });
    step(frames);
    expect(container.querySelector("path")?.getAttribute("d")).toMatch(/^M 40 30 /);
    unmount();
    expect(frames.size).toBe(0);
    expect(animation.killTweensOf).toHaveBeenCalled();
  });

  it("scopes aura animation to its own text and releases its tweens", () => {
    const { container, unmount } = render(<ColorfulCursorAura />);
    fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });
    expect(animation.to).not.toHaveBeenCalled();
    fireEvent.mouseMove(container.querySelector("section")!, { clientX: 150, clientY: 80 });
    expect(animation.to).toHaveBeenCalledTimes(1);
    unmount();
    expect(animation.killTweensOf).toHaveBeenCalled();
  });

});
