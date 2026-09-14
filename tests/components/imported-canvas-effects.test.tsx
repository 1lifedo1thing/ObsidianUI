import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { DottedGrid } from "@/components/block/dotted-grid";
import { DitherCanvas } from "@/components/block/dither-canvas";
import { InteractiveBlurReveal } from "@/components/block/interactive-blur-reveal";

const rect = { x: 80, y: 40, left: 80, top: 40, right: 400, bottom: 240, width: 320, height: 200, toJSON() {} };

function createCanvasContext() {
  return {
    setTransform: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(),
    fillText: vi.fn(), fillStyle: "", font: "", textAlign: "", textBaseline: "",
  };
}

function createWebGLContext() {
  const methods = [
    "createShader", "shaderSource", "compileShader", "getShaderParameter", "deleteShader",
    "createProgram", "attachShader", "linkProgram", "getProgramParameter", "deleteProgram",
    "useProgram", "createBuffer", "bindBuffer", "bufferData", "deleteBuffer", "getAttribLocation",
    "enableVertexAttribArray", "vertexAttribPointer", "getUniformLocation", "createTexture",
    "activeTexture", "bindTexture", "texParameteri", "texImage2D", "deleteTexture", "pixelStorei",
    "uniform1i", "uniform1f", "uniform1fv", "uniform2f", "uniform2fv", "uniform4fv",
    "viewport", "enable", "blendFunc", "clearColor", "clear", "drawArrays",
  ] as const;
  const context = Object.fromEntries(methods.map((name) => [name, vi.fn()])) as Record<(typeof methods)[number], ReturnType<typeof vi.fn>>;
  for (const name of ["createShader", "createProgram", "createBuffer", "createTexture"] as const) {
    context[name].mockImplementation(() => ({}));
  }
  context.getShaderParameter.mockReturnValue(true);
  context.getProgramParameter.mockReturnValue(true);
  context.getAttribLocation.mockReturnValue(0);
  context.getUniformLocation.mockImplementation((_, name) => name);
  return new Proxy(context, {
    get(target, key: string | symbol) {
      if (key in target) return target[key as keyof typeof target];
      return typeof key === "string" && /^[A-Z_0-9]+$/.test(key) ? 1 : undefined;
    },
  });
}

function mockContexts(webgl: ReturnType<typeof createWebGLContext> | null, canvas2d = createCanvasContext()) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    ((kind: string) => kind === "2d" ? canvas2d : webgl) as typeof HTMLCanvasElement.prototype.getContext,
  );
  return canvas2d;
}

describe("imported canvas effects", () => {
  const disconnected = vi.fn();

  beforeEach(() => {
    disconnected.mockClear();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect);
    vi.stubGlobal("devicePixelRatio", 1);
    vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(17));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect = disconnected;
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(2);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("server-renders all effects without creating a browser rendering context", () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const html = renderToString(<><DottedGrid /><DitherCanvas /><InteractiveBlurReveal /></>);
    expect(context).not.toHaveBeenCalled();
    expect(html).toContain("/effects/dither-canvas/dither-canvas-video.mp4");
    expect(html).toContain("/effects/interactive-blur-reveal/interactive-blur-reveal-img01.webp");
    expect(html).not.toContain("h-screen");
    expect(html).not.toContain("position:fixed");
  });

  it("sizes a paused dot grid to its surface and lets keyboard users change its shape", async () => {
    const context = mockContexts(null);
    const { container, unmount } = render(<DottedGrid paused />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(200);
    const firstFrame = context.arc.mock.calls.map((call) => call[2]);
    context.arc.mockClear();
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Change dotted grid shape" })).toHaveFocus();
    await user.keyboard("{Enter}");
    const secondFrame = context.arc.mock.calls.map((call) => call[2]);
    expect(secondFrame.length).toBe(firstFrame.length);
    expect(secondFrame).not.toEqual(firstFrame);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    unmount();
    expect(disconnected).toHaveBeenCalledOnce();
  });

  it("leaves local static media visible when WebGL is unavailable", () => {
    mockContexts(null);
    const { container } = render(<><DitherCanvas /><InteractiveBlurReveal /></>);
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("poster", "/effects/dither-canvas/dither-canvas-poster.webp");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("controls");
    expect(video.play).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Blue and cyan dither texture on white" })).toBeVisible();
    expect(video).toHaveClass("opacity-0");
    expect(video.parentElement).toHaveClass("bg-white");
    expect(screen.getByRole("img", { name: "ObsidianUI frosted image with a fluid cursor reveal" })).toBeVisible();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("cleans up dither GPU resources, playback, observation, and its animation on unmount", () => {
    const gl = createWebGLContext();
    mockContexts(gl);
    const { container, unmount } = render(<DitherCanvas />);
    const canvas = container.querySelector("canvas")!;
    const video = container.querySelector("video")!;
    expect(gl.uniform2f).toHaveBeenCalledWith("uRes", 320, 200);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    expect(gl.clearColor).toHaveBeenCalledWith(1, 1, 1, 1);
    expect(canvas.style.opacity).toBe("1");
    fireEvent(canvas, new MouseEvent("pointermove", { clientX: 180, clientY: 90 }));
    vi.mocked(requestAnimationFrame).mock.calls[0][0](16);
    expect(Array.from(gl.uniform4fv.mock.lastCall![1] as Float32Array).slice(0, 2)).toEqual([100, 50]);
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
    expect(gl.deleteTexture).toHaveBeenCalledTimes(3);
    expect(gl.deleteBuffer).toHaveBeenCalledOnce();
    expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    expect(gl.deleteProgram).toHaveBeenCalledOnce();
    expect(video.pause).toHaveBeenCalled();
    expect(disconnected).toHaveBeenCalledOnce();
  });

  it("renders a static dither frame without autoplay under reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
    const gl = createWebGLContext();
    mockContexts(gl);
    const { container } = render(<DitherCanvas />);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
    expect(container.querySelector("video")!.play).not.toHaveBeenCalled();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("keeps a bright fallback while the dither video loads, then shows its white canvas", () => {
    const readyState = vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(0);
    const gl = createWebGLContext();
    mockContexts(gl);
    const { container } = render(<DitherCanvas />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.style.opacity).toBe("0");
    expect(screen.getByRole("img", { name: "Blue and cyan dither texture on white" })).toBeVisible();
    expect(gl.drawArrays).not.toHaveBeenCalled();

    readyState.mockReturnValue(2);
    vi.mocked(requestAnimationFrame).mock.calls[0][0](16);
    expect(canvas.style.opacity).toBe("1");
    expect(gl.clearColor).toHaveBeenCalledWith(1, 1, 1, 1);
    expect(gl.drawArrays).toHaveBeenCalledOnce();
  });

  it("releases blur resources even when unmounted before the images load", async () => {
    const gl = createWebGLContext();
    mockContexts(gl);
    vi.stubGlobal("Image", class extends EventTarget { complete = false; naturalWidth = 0; });
    const { unmount } = render(<InteractiveBlurReveal />);
    expect(gl.createProgram).toHaveBeenCalledOnce();
    unmount();
    await Promise.resolve();
    expect(gl.deleteProgram).toHaveBeenCalledOnce();
    expect(gl.deleteBuffer).toHaveBeenCalledOnce();
    expect(gl.createTexture).not.toHaveBeenCalled();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("renders the original blur shader inside the container and releases its textures", async () => {
    const gl = createWebGLContext();
    mockContexts(gl);
    vi.stubGlobal("Image", class extends EventTarget { complete = true; naturalWidth = 1200; });
    const { container, unmount } = render(<InteractiveBlurReveal paused />);
    await waitFor(() => expect(gl.drawArrays).toHaveBeenCalledOnce());
    expect(gl.uniform2f).toHaveBeenCalledWith("iResolution", 320, 200);
    expect(container.querySelector("canvas")!.style.opacity).toBe("1");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    unmount();
    expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
    expect(gl.deleteProgram).toHaveBeenCalledOnce();
    expect(gl.deleteBuffer).toHaveBeenCalledOnce();
    expect(disconnected).toHaveBeenCalledOnce();
  });

  it("falls back and frees allocations when the dither shader fails to compile", () => {
    const gl = createWebGLContext();
    gl.getShaderParameter.mockReturnValue(false);
    mockContexts(gl);
    const { container } = render(<DitherCanvas />);
    expect(container.querySelector("canvas")!.style.opacity).toBe("0");
    expect(gl.deleteShader).toHaveBeenCalledOnce();
    expect(gl.deleteProgram).toHaveBeenCalledOnce();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
