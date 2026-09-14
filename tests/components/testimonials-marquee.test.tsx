import type { ComponentProps, ReactNode } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const preferences = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => preferences.reducedMotion,
}));

// Radix waits for an image-load event before rendering the image. Keep the
// supplied avatar URL observable without relying on network access in jsdom.
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <span data-avatar-src={src} data-avatar-alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/landing/herosection", () => ({ HeroSection: () => <div>Landing hero</div> }));
vi.mock("@/components/landing/landing-faq", () => ({
  LandingFAQ: () => <section aria-label="Frequently Asked Questions" />,
}));
vi.mock("@/components/landing/video-showcase-grid", () => ({
  VideoShowcaseGrid: () => <section aria-label="Featured Components" />,
}));
vi.mock("@/components/landing/landing-page-grid", () => ({
  LandingPageGrid: () => <section aria-label="Old component scrolling section" />,
}));
vi.mock("@/components/block/smooth-scroll", () => ({
  SmoothScroll: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/landing/mobile-notification", () => ({ MobileNotification: () => null }));

import { TestimonialsMarquee } from "@/components/landing/testimonials-marquee";
import HomePage from "@/components/pages/home-page";

describe("landing testimonials marquee", () => {
  let intersection: IntersectionObserverCallback;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    preferences.reducedMotion = false;
    observe = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { intersection = callback; }
      observe = observe;
      disconnect = disconnect;
    });
  });

  function updateVisibility(isIntersecting: boolean) {
    act(() => intersection(
      [{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver,
    ));
  }

  it("omits the example caption and keeps only the eight unique reviews accessible", () => {
    const { container } = render(<TestimonialsMarquee />);
    const section = screen.getByRole("region", { name: "Made for people who love building." });
    expect(within(section).queryByText("Illustrative testimonials · Fictional profiles")).not.toBeInTheDocument();
    expect(within(section).getAllByRole("listitem")).toHaveLength(8);
    expect(container.querySelectorAll("li")).toHaveLength(16);
    const duplicateLists = container.querySelectorAll('ul[aria-hidden="true"]');
    expect(duplicateLists).toHaveLength(2);
    for (const list of duplicateLists) {
      expect(list).toHaveAttribute("inert");
      expect(list.querySelectorAll("li")).toHaveLength(4);
    }
  });

  it("uses eight seeded DiceBear Notionists profiles for the unique reviews", () => {
    render(<TestimonialsMarquee />);
    const reviews = screen.getAllByRole("listitem");
    const urls = reviews.map(review => new URL(
      review.querySelector("[data-avatar-src]")!.getAttribute("data-avatar-src")!,
    ));
    for (const url of urls) {
      expect(url.origin).toBe("https://api.dicebear.com");
      expect(url.pathname).toBe("/9.x/notionists/svg");
      expect(url.searchParams.get("seed")).toBeTruthy();
    }
    expect(new Set(urls.map(url => url.searchParams.get("seed"))).size).toBe(8);
  });

  it("runs only while on screen and disconnects its observer on unmount", () => {
    const { unmount } = render(<TestimonialsMarquee />);
    const viewport = screen.getByRole("group", {
      name: "ObsidianUI testimonials",
    });
    expect(viewport).toHaveClass("testimonials-marquee");
    expect(viewport).toHaveAttribute("data-running", "false");
    expect(observe).toHaveBeenCalledWith(viewport);
    updateVisibility(true);
    expect(viewport).toHaveAttribute("data-running", "true");
    updateVisibility(false);
    expect(viewport).toHaveAttribute("data-running", "false");
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("gives each row its own keyboard pause target without focusing the shared viewport", async () => {
    const user = userEvent.setup();
    render(<TestimonialsMarquee />);
    const viewport = screen.getByRole("group", {
      name: "ObsidianUI testimonials",
    });
    const firstRow = screen.getByRole("group", {
      name: "Testimonials row 1. Hover or focus to pause this row.",
    });
    const secondRow = screen.getByRole("group", {
      name: "Testimonials row 2. Hover or focus to pause this row.",
    });
    expect(viewport).not.toHaveAttribute("tabindex");
    expect(within(firstRow).getAllByRole("listitem")).toHaveLength(4);
    expect(within(secondRow).getAllByRole("listitem")).toHaveLength(4);
    await user.tab();
    expect(firstRow).toHaveFocus();
    expect(secondRow).not.toHaveFocus();
    await user.tab();
    expect(secondRow).toHaveFocus();
    expect(firstRow).not.toHaveFocus();
  });

  it("keeps the marquee stopped when reduced motion is preferred", () => {
    preferences.reducedMotion = true;
    render(<TestimonialsMarquee />);
    const viewport = screen.getByRole("group", {
      name: "ObsidianUI testimonials",
    });
    expect(viewport).toHaveAttribute("data-reduced-motion", "true");
    expect(viewport).toHaveAttribute("data-running", "false");
    updateVisibility(true);
    expect(viewport).toHaveAttribute("data-running", "false");
  });

  it("places the marquee between featured components and the FAQ on the homepage", () => {
    render(<HomePage />);
    const marquee = screen.getByRole("region", { name: "Made for people who love building." });
    const featured = screen.getByRole("region", { name: "Featured Components" });
    const faq = screen.getByRole("region", { name: "Frequently Asked Questions" });
    expect(featured.compareDocumentPosition(marquee) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(marquee.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Old component scrolling section" })).not.toBeInTheDocument();
  });
});
