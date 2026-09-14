import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({
  pathname: "/docs/flip-text",
  reduceMotion: false,
}));

vi.mock("next/navigation", () => ({ usePathname: () => controls.pathname }));
vi.mock("motion/react", async importOriginal => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, animate: vi.fn(actual.animate), useReducedMotion: () => controls.reduceMotion };
});

import { DocsWorkspace } from "@/components/docs/docs-workspace";
import { animate } from "motion/react";
import navigation from "@/content/_meta";

const publishedPages = Object.entries(navigation)
  .filter((entry): entry is [string, string] => typeof entry[1] === "string")
  .map(([slug, title]) => ({ href: `/docs/${slug}`, title }));

describe("documentation workspace", () => {
  beforeEach(() => {
    controls.pathname = "/docs/flip-text";
    controls.reduceMotion = false;
    vi.mocked(animate).mockClear();
  });

  it("offers every published documentation destination and marks only the current page", () => {
    render(<DocsWorkspace><h1>Flip Text</h1></DocsWorkspace>);

    const nav = within(screen.getByRole("navigation", { name: "Documentation" }));
    expect(nav.getAllByRole("link").map(link => ({
      href: link.getAttribute("href"),
      title: link.textContent,
    }))).toEqual(publishedPages);
    expect(nav.getAllByRole("link", { current: "page" })).toEqual([
      nav.getByRole("link", { name: "Flip Text" }),
    ]);
    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Docs/Flip Text");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Documentation" }).querySelector("svg")).toBeNull();
    expect(screen.getByLabelText("Breadcrumb").querySelector("svg")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Flip Text" })).toBeVisible();
    expect(nav.queryByRole("link", { name: "AI Input" })).not.toBeInTheDocument();
    expect(nav.queryByRole("link", { name: "Spotlight Navbar" })).not.toBeInTheDocument();
  });

  it("places documentation links under their component category headings", () => {
    render(<DocsWorkspace>Article</DocsWorkspace>);
    const nav = within(screen.getByRole("navigation", { name: "Documentation" }));
    for (const [category, title] of [
      ["Buttons", "Arrow Fill Button"],
      ["Files & Media", "Folder Preview"],
      ["Menus & Navigation", "Circle Menu"],
      ["Cursor Effects", "Magnetic Image Trail"],
      ["Text Animations", "Flip Text"],
    ]) {
      const section = nav.getByRole("heading", { level: 2, name: category }).closest("section")!;
      expect(within(section).getByRole("link", { name: new RegExp(`^${title}(?:, new component)?$`) })).toBeVisible();
    }
  });

  it("updates the active destination on navigation and does not match a partial pathname", () => {
    const { rerender } = render(<DocsWorkspace>Article</DocsWorkspace>);
    controls.pathname = "/docs/cli";
    rerender(<DocsWorkspace>Article</DocsWorkspace>);
    expect(screen.getByRole("link", { current: "page" })).toHaveAccessibleName("CLI");
    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Docs/CLI");

    controls.pathname = "/docs/cli-example";
    rerender(<DocsWorkspace>Article</DocsWorkspace>);
    expect(screen.queryByRole("link", { current: "page" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Docs/Documentation");
  });

  it("restores every destination through the icon toggle and makes fading links inert when collapsed", async () => {
    const user = userEvent.setup();
    render(<DocsWorkspace>Article</DocsWorkspace>);
    const toggle = screen.getByRole("button", { name: "Collapse documentation sidebar" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle.querySelector("svg.is-visible")).toHaveClass("lucide-panel-left-close");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAccessibleName("Expand documentation sidebar");
    expect(toggle.querySelector("svg.is-visible")).toHaveClass("lucide-panel-left-open");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const controlledNavigation = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(controlledNavigation).toHaveAttribute("inert");
    expect(controlledNavigation).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Documentation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Component showcase" })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(controlledNavigation).not.toHaveAttribute("inert");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    const nav = within(screen.getByRole("navigation", { name: "Documentation" }));
    const linksByHref = new Map(nav.getAllByRole("link").map(link => [link.getAttribute("href"), link]));
    for (const { title, href } of publishedPages) {
      const link = linksByHref.get(href);
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAccessibleName(new RegExp(`^${title}(?:, new component)?$`));
      expect(link).toBeVisible();
    }
    expect(nav.getByRole("link", { current: "page" })).toHaveAccessibleName("Flip Text");
    expect(screen.getByRole("link", { name: "Component showcase" })).toHaveAttribute("href", "/components");
  });

  it("opens the mobile sheet and closes it after choosing a real documentation link", async () => {
    const user = userEvent.setup();
    // Keep real Next links and Radix focus handling; jsdom cannot navigate pages.
    render(<div onClick={event => {
      if ((event.target as Element).closest("a")) event.preventDefault();
    }}><DocsWorkspace>Article</DocsWorkspace></div>);

    const trigger = screen.getByRole("button", { name: "Open documentation menu" });
    expect(trigger).toHaveTextContent("Menu");
    await user.click(trigger);
    const sheet = await screen.findByRole("dialog");
    expect(sheet).toHaveAccessibleName(/ObsidianUI/);
    expect(sheet).toHaveAccessibleDescription("Browse the ObsidianUI documentation.");
    expect(within(sheet).queryByRole("searchbox")).not.toBeInTheDocument();
    expect(within(sheet).getByRole("navigation", { name: "Documentation" }).querySelector("svg")).toBeNull();
    const nav = within(within(sheet).getByRole("navigation", { name: "Documentation" }));
    expect(nav.getAllByRole("link")).toHaveLength(publishedPages.length);
    for (const category of ["Buttons", "Files & Media", "Menus & Navigation", "Text Animations", "Cursor Effects"]) {
      expect(nav.getByRole("heading", { level: 2, name: category })).toBeVisible();
    }
    expect(nav.getByRole("link", { current: "page" })).toHaveAccessibleName("Flip Text");
    const destination = nav.getByRole("link", { name: "Circle Menu" });
    expect(destination).toHaveAttribute("href", "/docs/circle-menu");

    await user.click(destination);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("dismisses the mobile sheet with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<DocsWorkspace>Article</DocsWorkspace>);
    const trigger = screen.getByRole("button", { name: "Open documentation menu" });
    await user.click(trigger);
    expect(await screen.findByRole("dialog")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes the mobile menu after a route change and keeps it closed when returning", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DocsWorkspace>Article</DocsWorkspace>);
    await user.click(screen.getByRole("button", { name: "Open documentation menu" }));
    expect(await screen.findByRole("dialog")).toBeVisible();

    controls.pathname = "/docs/circle-menu";
    rerender(<DocsWorkspace>Article</DocsWorkspace>);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("link", { current: "page" })).toHaveAccessibleName("Circle Menu");

    controls.pathname = "/docs/flip-text";
    rerender(<DocsWorkspace>Article</DocsWorkspace>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open documentation menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("tracks a clicked outline heading below the sticky header, follows scrolling, and cleans up", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.set(++frameId, callback);
      return frameId;
    });
    const cancelFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
    const removeListener = vi.spyOn(window, "removeEventListener");
    const disconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
    let usageTop = 700;
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("docs-toolbar")) return new DOMRect(0, 72, 800, 48);
      if (this.id === "installation") return new DOMRect(0, 0, 600, 32);
      if (this.id === "usage") return new DOMRect(0, usageTop, 600, 32);
      return originalRect.call(this);
    });
    const flushFrames = () => act(() => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(0));
    });
    const originalPadding = document.documentElement.style.scrollPaddingTop;
    document.documentElement.style.scrollPaddingTop = "64px";
    const { unmount } = render(<DocsWorkspace>
      <nav className="nextra-toc" aria-label="On this page">
        <a href="#installation" onClick={event => event.preventDefault()}>Installation</a>
        <a href="#usage" onClick={event => event.preventDefault()}>Usage</a>
      </nav>
      <h2 id="installation" style={{ scrollMarginTop: 144 }}>Installation</h2>
      <h2 id="usage" style={{ scrollMarginTop: 144 }}>Usage</h2>
    </DocsWorkspace>);

    try {
      const outline = within(screen.getByRole("navigation", { name: "On this page" }));
      const installation = outline.getByRole("link", { name: "Installation" });
      const usage = outline.getByRole("link", { name: "Usage" });
      flushFrames();
      expect(installation).toHaveAttribute("aria-current", "location");

      fireEvent.click(usage);
      usageTop = 208; // Native anchor landing: 144px scroll margin + 64px scroll padding.
      fireEvent(window, new Event("hashchange"));
      flushFrames();
      expect(usage).toHaveAttribute("aria-current", "location");
      expect(installation).not.toHaveAttribute("aria-current");

      usageTop = 360;
      fireEvent.scroll(window);
      flushFrames();
      expect(installation).toHaveAttribute("aria-current", "location");
      expect(usage).not.toHaveAttribute("aria-current");

      fireEvent.scroll(window);
      const pendingFrame = frameId;
      unmount();
      expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
      expect(frames.size).toBe(0);
      expect(disconnect).toHaveBeenCalledOnce();
      for (const event of ["scroll", "resize", "hashchange"]) {
        expect(removeListener).toHaveBeenCalledWith(event, expect.any(Function));
      }
      expect(installation).not.toHaveAttribute("aria-current");
      requestFrame.mockClear();
      fireEvent.scroll(window);
      fireEvent.resize(window);
      fireEvent(window, new Event("hashchange"));
      expect(requestFrame).not.toHaveBeenCalled();
    } finally {
      unmount();
      document.documentElement.style.scrollPaddingTop = originalPadding;
    }
  });

  it("measures a connected rail through wrapped nested headings and moves immediately with reduced motion", async () => {
    controls.reduceMotion = true;
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
    let nestedHeadingTop = 700;
    let wrappedHeight = 44;
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("docs-toolbar")) return new DOMRect(0, 52, 800, 48);
      if (this.id === "overview") return new DOMRect(0, 0, 600, 32);
      if (this.id === "nested-example") return new DOMRect(0, nestedHeadingTop, 600, 32);
      if (this.id === "reference") return new DOMRect(0, 1200, 600, 32);
      if (this.tagName === "UL" && this.closest(".nextra-toc")) return new DOMRect(0, 100, 200, 150);
      if (this.tagName === "A") {
        if (this.getAttribute("href") === "#overview") return new DOMRect(0, 108, 200, 22);
        if (this.getAttribute("href") === "#nested-example") return new DOMRect(0, 138, 200, wrappedHeight);
        if (this.getAttribute("href") === "#reference") return new DOMRect(0, 146 + wrappedHeight, 200, 22);
      }
      return originalRect.call(this);
    });
    const flushFrames = () => act(() => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(0));
    });
    const { container, unmount } = render(<DocsWorkspace>
      <nav className="nextra-toc" aria-label="On this page">
        <ul>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#nested-example">A nested example with a wrapped title</a></li>
          <li><a href="#reference">Reference</a></li>
        </ul>
      </nav>
      <h2 id="overview">Overview</h2>
      <h3 id="nested-example">A nested example with a wrapped title</h3>
      <h2 id="reference">Reference</h2>
    </DocsWorkspace>);

    try {
      flushFrames();
      const track = container.querySelector(".docs-toc-track")!;
      const marker = container.querySelector<HTMLElement>(".docs-toc-marker")!;
      const nestedLink = screen.getByRole("link", { name: "A nested example with a wrapped title" });
      expect(track).toHaveAttribute("d", "M 5 0 L 5 19 L 5 30 L 17 38 L 17 60 L 17 82 L 5 90 L 5 101");
      expect(nestedLink.style.getPropertyValue("--toc-indent")).toBe("12px");
      expect(marker.style.offsetDistance).toBe("19px");

      nestedHeadingTop = 100;
      fireEvent(window, new Event("hashchange"));
      flushFrames();
      expect(nestedLink).toHaveAttribute("aria-current", "location");
      // Motion captures its own requestAnimationFrame at import time; wait for
      // its render pass after flushing the separately mocked scroll-spy frame.
      await waitFor(() => expect(parseFloat(marker.style.offsetDistance)).toBeCloseTo(30 + Math.hypot(12, 8) + 22));
      expect(animate).not.toHaveBeenCalled();

      wrappedHeight = 66;
      fireEvent.resize(window);
      flushFrames();
      expect(track).toHaveAttribute("d", "M 5 0 L 5 19 L 5 30 L 17 38 L 17 71 L 17 104 L 5 112 L 5 123");
      expect(container.querySelector(".docs-toc-end")).toHaveAttribute("cy", "123");

      controls.reduceMotion = false;
      wrappedHeight = 88;
      fireEvent.resize(window);
      flushFrames();
      expect(animate).toHaveBeenCalledWith(expect.anything(), expect.any(Number), { duration: 0.25, ease: [0.22, 1, 0.36, 1] });
    } finally {
      unmount();
    }
    expect(container.querySelector(".docs-toc-rail")).toBeNull();
  });
});
