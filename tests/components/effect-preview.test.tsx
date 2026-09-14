import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { EffectPreview } from "@/components/catalog/effect-preview";

vi.mock("next/dynamic", () => ({ default: () => function PreviewEffect() { return <div data-testid="running-effect" />; } }));

afterEach(() => vi.unstubAllGlobals());

it("mounts a live effect only near the viewport and disposes it when the card leaves", () => {
    let observeVisibility: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
        constructor(callback: IntersectionObserverCallback) { observeVisibility = callback; }
        observe = vi.fn();
        disconnect = disconnect;
    });
    const view = render(<EffectPreview slug="dither-canvas" compact />);
    expect(screen.queryByTestId("running-effect")).not.toBeInTheDocument();
    act(() => observeVisibility([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByTestId("running-effect")).toBeInTheDocument();
    act(() => observeVisibility([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.queryByTestId("running-effect")).not.toBeInTheDocument();
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
});
