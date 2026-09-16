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

import * as THREE from "three";
import { CurvedPlane } from "@/components/block/curved-plane";
import { BookFlip } from "@/components/block/book-flip";
import { FractalGlass } from "@/components/block/fractal-glass";
import { GridLift } from "@/components/block/grid-lift";
import { InteractiveHoverSlider } from "@/components/block/interactive-hover-slider";
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
  });

  afterEach(() => vi.unstubAllGlobals());

  it("keeps book page navigation usable as native buttons", () => {
    const { unmount } = render(<BookFlip />);
    expect(screen.getByRole("button", { name: "Cover" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Cover" })).toHaveAttribute("aria-pressed", "false");
    unmount();
  });

  it("shows the local image fallback when WebGL cannot initialize", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { WebGLSurface } = await vi.importActual<typeof import("@/lib/effects/shared/webgl-surface")>("@/lib/effects/shared/webgl-surface");
    const { unmount } = render(<WebGLSurface imageSrc="/effects/fractal-glass/image10.jpg" label="Glass image"><span>GPU content</span></WebGLSurface>);
    expect(screen.getByRole("img", { name: "Glass image" })).toHaveStyle({ backgroundImage: 'url("/effects/fractal-glass/image10.jpg")' });
    expect(screen.queryByText("GPU content")).not.toBeInTheDocument();
    unmount();
  });

  it("keeps glass pointer coordinates local and disposes its renderer, geometry, and material", async () => {
    const geometryDispose = vi.spyOn(THREE.BufferGeometry.prototype, "dispose");
    const materialDispose = vi.spyOn(THREE.Material.prototype, "dispose");
    const { container, unmount } = render(<FractalGlass />);
    await act(async () => { await Promise.resolve(); });
    const renderer = environment.renderers[0];
    expect(renderer.setSize).toHaveBeenCalledWith(400, 300);
    const surface = container.querySelector("canvas")!.parentElement!;
    fireEvent(surface, new MouseEvent("pointermove", { clientX: 200, clientY: 190 }));
    const [id, frame] = frames.entries().next().value!;
    frames.delete(id);
    frame(16);
    const scene = renderer.render.mock.lastCall![0] as THREE.Scene;
    const material = (scene.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;
    expect(material.uniforms.uMouse.value.x).toBeCloseTo(0.49);
    unmount();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(geometryDispose).toHaveBeenCalled();
    expect(materialDispose).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("renders glass once with reduced motion and schedules no continuous animation", async () => {
    environment.reducedMotion = true;
    const { unmount } = render(<FractalGlass />);
    await act(async () => { await Promise.resolve(); });
    expect(environment.renderers[0].render).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    unmount();
  });

  it("loads the curved gallery inside the container and cancels its animation on unmount", async () => {
    const { unmount } = render(<CurvedPlane />);
    await waitFor(() => expect(environment.renderers).toHaveLength(1));
    const renderer = environment.renderers[0];
    expect(renderer.setSize).toHaveBeenCalledWith(400, 300);
    expect(frames.size).toBe(1);
    unmount();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
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

  it("lets a keyboard user select a hover-slider project without pointer movement", async () => {
    environment.reducedMotion = true;
    const { unmount } = render(<InteractiveHoverSlider compact />);
    await act(async () => { await Promise.resolve(); });
    const second = screen.getByRole("button", { name: /Project 02: Botanical/ });
    fireEvent.focus(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(frames.size).toBe(0);
    unmount();
    expect(environment.renderers[0].dispose).toHaveBeenCalledOnce();
  });

  it("renders a container-sized grid and releases its observer and animation", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(80);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(60);
    const context = new Proxy({ getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 0]) }), measureText: () => ({ width: 40 }) }, {
      get(target, key) { return key in target ? target[key as keyof typeof target] : vi.fn(); },
      set() { return true; },
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as ReturnType<HTMLCanvasElement["getContext"]>);
    const { unmount } = render(<GridLift showControls />);
    const canvas = screen.getByRole("img", { name: "Interactive raised ObsidianUI grid" }) as HTMLCanvasElement;
    expect(canvas.width).toBe(80 * Math.min(window.devicePixelRatio, 2));
    expect(canvas.height).toBe(60 * Math.min(window.devicePixelRatio, 2));
    fireEvent.click(screen.getByRole("button", { name: "Text" }));
    expect(screen.getByRole("textbox", { name: "Grid mask text" })).toHaveValue("OBSIDIANUI");
    unmount();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalled();
  });
});
