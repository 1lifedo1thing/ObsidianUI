import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import gsap from "gsap";
import { TextStream } from "@/components/block/text-stream";

describe("TextStream lifecycle", () => {
  let reduced: boolean;
  let activeTicks: Set<gsap.TickerCallback>;

  beforeEach(() => {
    reduced = false;
    activeTicks = new Set();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("no-preference") ? !reduced : reduced,
      media: query,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList);
    vi.spyOn(gsap.ticker, "add").mockImplementation((callback) => {
      activeTicks.add(callback);
      return callback;
    });
    vi.spyOn(gsap.ticker, "remove").mockImplementation((callback) => {
      activeTicks.delete(callback);
    });
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps one loop in Strict Mode and removes its scoped wheel listener, observer and timer", () => {
    vi.useFakeTimers();
    const scroller = document.createElement("div");
    const removeListener = vi.spyOn(scroller, "removeEventListener");
    const disconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
    const { container, unmount } = render(
      <React.StrictMode>
        <TextStream items={["Motion", "Type"]} scroller={{ current: scroller }} height="300px" />
      </React.StrictMode>,
    );
    expect(activeTicks.size).toBe(1);
    const copies = container.querySelectorAll(".obsidian-text-stream__copy");
    expect(copies.length).toBeGreaterThan(2);
    copies.forEach((copy, index) => {
      expect(copy).toHaveAttribute("aria-hidden", String(index > 0));
    });
    fireEvent.wheel(scroller, { deltaY: 120 });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(activeTicks.size).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(removeListener).toHaveBeenCalledWith("wheel", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("supports empty items becoming populated and removes the loop when items become empty", () => {
    const { container, rerender, unmount } = render(<TextStream items={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(activeTicks.size).toBe(0);
    rerender(<TextStream items={["Interfaces", "Motion"]} />);
    expect(activeTicks.size).toBe(1);
    rerender(<TextStream items={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(activeTicks.size).toBe(0);
    unmount();
  });

  it("keeps the source text available without an animation loop for reduced motion", () => {
    reduced = true;
    const { container, unmount } = render(<TextStream items={["Interfaces", "Motion"]} />);
    expect(container.querySelector('[aria-hidden="false"]')).toHaveTextContent("InterfacesMotion");
    expect(activeTicks.size).toBe(0);
    unmount();
  });
});
