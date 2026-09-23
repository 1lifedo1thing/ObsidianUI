import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { EffectPreview } from "@/components/catalog/effect-preview";

vi.mock("next/dynamic", () => ({ default: () => function PreviewEffect() { return <div data-testid="running-effect" />; } }));

afterEach(() => vi.unstubAllGlobals());

it("mounts a live effect only near the viewport and disposes it on unmount", () => {
    let observeVisibility: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
        constructor(callback: IntersectionObserverCallback) { observeVisibility = callback; }
        observe = vi.fn();
        disconnect = disconnect;
    });
    const view = render(<EffectPreview slug="text-stream" compact />);
    expect(screen.queryByTestId("running-effect")).not.toBeInTheDocument();
    act(() => observeVisibility([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByTestId("running-effect")).toBeInTheDocument();
    view.unmount();
    expect(screen.queryByTestId("running-effect")).not.toBeInTheDocument();
    expect(disconnect).toHaveBeenCalledOnce();
});
