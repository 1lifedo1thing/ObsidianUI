import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const environment = vi.hoisted(() => ({ reducedMotion: false, renderers: [] as { domElement: HTMLCanvasElement; setSize: ReturnType<typeof vi.fn>; render: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn> }[] }));

vi.mock("@/lib/effects/shared/webgl-surface", () => ({
  WebGLSurface: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useEffectReducedMotion: () => environment.reducedMotion,
}));

vi.mock("@react-three/fiber", () => ({ Canvas: () => <div />, useThree: vi.fn(), useFrame: vi.fn() }));
vi.mock("@react-three/drei", () => ({ useTexture: Object.assign(vi.fn(), { preload: vi.fn() }), Environment: () => null, OrbitControls: () => null }));

vi.mock("three", async (importOriginal) => {
  const original = await importOriginal<typeof import("three")>();
  return {
    ...original,
    WebGLRenderer: class {
      domElement = document.createElement("canvas");
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      setClearColor = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
      constructor() { environment.renderers.push(this); }
    },
    TextureLoader: class {
      setCrossOrigin() {}
      load(_url: string, onLoad?: (texture: import("three").Texture) => void) {
        const texture = new original.Texture({ width: 640, height: 480 } as TexImageSource);
        queueMicrotask(() => onLoad?.(texture));
        return texture;
      }
    },
  };
});

import { ArtGallery } from "@/components/block/art-gallery";

describe("WebGL effect lifecycles", () => {
  const frames = new Map<number, FrameRequestCallback>();
  const disconnect = vi.fn();
  let nextFrame = 0;
  const rect = { x: 100, y: 40, left: 100, top: 40, right: 500, bottom: 340, width: 400, height: 300, toJSON() {} };

  beforeEach(() => {
    environment.reducedMotion = false;
    environment.renderers.length = 0;
    frames.clear();
    disconnect.mockClear();
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect);
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));
    vi.stubGlobal("Image", class {
      complete = true;
      naturalWidth = 400;
      naturalHeight = 300;
      decoding = "auto";
      crossOrigin = "";
      _src = "";
      get src() { return this._src; }
      set src(value: string) {
        this._src = value;
        queueMicrotask(() => this.onload?.());
      }
      decode() { return Promise.resolve(); }
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("shows the local image fallback when WebGL cannot initialize", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { WebGLSurface } = await vi.importActual<typeof import("@/lib/effects/shared/webgl-surface")>("@/lib/effects/shared/webgl-surface");
    const { unmount } = render(<WebGLSurface imageSrc="/logo.svg" label="Gallery image"><span>GPU content</span></WebGLSurface>);
    expect(screen.getByRole("img", { name: "Gallery image" })).toHaveStyle({ backgroundImage: 'url("/logo.svg")' });
    expect(screen.queryByText("GPU content")).not.toBeInTheDocument();
    unmount();
  });

  it("pans the art gallery from pointer drags and disposes its renderer", async () => {
    const { container, unmount } = render(<ArtGallery className="h-[400px]" />);
    await waitFor(() => expect(environment.renderers).toHaveLength(1));
    await act(async () => {
      for (let index = 0; index < 40; index += 1) await Promise.resolve();
    });
    const renderer = environment.renderers[0];
    expect(renderer.setSize).toHaveBeenCalledWith(400, 300);
    const surface = container.querySelector("canvas")!.parentElement!;
    fireEvent.pointerDown(surface, { clientX: 180, clientY: 140, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: 240, clientY: 90, pointerId: 1 });
    const [id, frame] = frames.entries().next().value!;
    frames.delete(id);
    frame(16);
    expect(renderer.render).toHaveBeenCalled();
    unmount();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

});
