import React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MagneticImageTrail } from "@/components/block/magnetic-image-trail";

describe("cursor effect isolation and lifecycle", () => {
  let reduced: boolean;
  let preferenceListeners: Set<() => void>;
  let frames: Map<number, FrameRequestCallback>;
  let canvasContext: Record<string, ReturnType<typeof vi.fn>>;
  let resizeDisconnect: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    reduced = false;
    preferenceListeners = new Set();
    frames = new Map();
    resizeDisconnect = vi.fn<() => void>();
    vi.stubGlobal("PointerEvent", MouseEvent);
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      get matches() { return query.includes("reduced-motion") && reduced; },
      media: query,
      addEventListener: (_type: string, listener: () => void) => preferenceListeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => preferenceListeners.delete(listener),
    }) as unknown as MediaQueryList);
    let frameId = 1;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const id = frameId++;
      frames.set(id, callback);
      return id;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => { frames.delete(id); });
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() { resizeDisconnect(); }
    });
    canvasContext = Object.fromEntries(
      ["setTransform", "clearRect", "save", "translate", "drawImage", "restore"].map((name) => [name, vi.fn()]),
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    vi.stubGlobal("Image", class {
      complete = true;
      naturalWidth = 400;
      naturalHeight = 300;
      src = "";
      crossOrigin = "";
      onload: (() => void) | null = null;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.cursor = "";
  });

  it("runs one image trail loop in Strict Mode and removes observers and frames on unmount", () => {
    const { container, unmount } = render(<React.StrictMode><MagneticImageTrail height={320} /></React.StrictMode>);
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    expect(frames.size).toBe(1);
    const [id, callback] = [...frames.entries()][0];
    frames.delete(id);
    act(() => callback(100));
    expect(canvasContext.drawImage).toHaveBeenCalled();
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
    expect(preferenceListeners.size).toBe(0);
    expect(resizeDisconnect).toHaveBeenCalledTimes(2);
  });

  it("renders a static image cluster for reduced motion and stops when the preference changes", () => {
    reduced = true;
    const { unmount } = render(<MagneticImageTrail height={320} />);
    expect(canvasContext.drawImage).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    reduced = false;
    act(() => preferenceListeners.forEach((listener) => listener()));
    expect(frames.size).toBe(1);
    reduced = true;
    act(() => preferenceListeners.forEach((listener) => listener()));
    expect(frames.size).toBe(0);
    unmount();
  });

  it("shrinks the image cards and orbit when the preview container becomes smaller", () => {
    let width = 720;
    let height = 520;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => height);
    render(<MagneticImageTrail />);
    const drawFrame = (time: number) => {
      const [id, callback] = [...frames.entries()][0];
      frames.delete(id);
      act(() => callback(time));
    };
    drawFrame(100);
    const wideCard = Math.max(...canvasContext.drawImage.mock.calls.map((call) => Number(call[7])));
    const wideOrbit = Math.max(...canvasContext.translate.mock.calls.map((call) => Number(call[0]))) -
      Math.min(...canvasContext.translate.mock.calls.map((call) => Number(call[0])));
    canvasContext.drawImage.mockClear();
    canvasContext.translate.mockClear();
    width = 320;
    height = 230;
    drawFrame(100);
    const smallCard = Math.max(...canvasContext.drawImage.mock.calls.map((call) => Number(call[7])));
    const smallOrbit = Math.max(...canvasContext.translate.mock.calls.map((call) => Number(call[0]))) -
      Math.min(...canvasContext.translate.mock.calls.map((call) => Number(call[0])));
    expect(smallCard).toBeGreaterThan(0);
    expect(smallCard).toBeLessThan(wideCard / 2);
    expect(smallOrbit).toBeLessThan(wideOrbit / 2);
  });
});
