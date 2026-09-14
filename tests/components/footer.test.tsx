import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/components/block/visitor-count", () => ({
  VisitorCount: () => <div role="status">123 unique visitors</div>,
}));

import Footer from "@/components/landing/footer";

describe("site footer", () => {
  beforeEach(() => { route.pathname = "/"; });

  it("adapts the four reference columns to real ObsidianUI destinations", () => {
    render(<Footer />);
    const navigation = screen.getByRole("navigation", { name: "Footer" });
    expect(within(navigation).getAllByRole("heading").map(heading => heading.textContent))
      .toEqual(["Product", "Socials", "Open Source", "Get started"]);
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/#faq");
    expect(screen.getByRole("link", { name: "Developers" })).toHaveAttribute("href", "/developers");
    expect(screen.getByRole("link", { name: "CLI" })).toHaveAttribute("href", "/docs/cli");
    expect(screen.getByRole("link", { name: "MIT license" }))
      .toHaveAttribute("href", "https://github.com/Atharvsinh-codez/ObsidianUI/blob/main/LICENSE");
    expect(screen.getByRole("link", { name: "Built by Atharv" })).toHaveAttribute("href", "https://athrix.me");
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toBe("#");
      if (link.getAttribute("href")?.startsWith("https://")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
    expect(screen.queryByText("Anywhere")).not.toBeInTheDocument();
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });

  it("shows the decorative homepage wordmark with the brand and visitor count", () => {
    const { container } = render(<Footer />);
    expect(screen.getByRole("status")).toHaveTextContent("123 unique visitors");
    expect(screen.getByRole("link", { name: "ObsidianUI home" })).toHaveAttribute("href", "/");
    expect(screen.getByText(/ObsidianUI\. Make every detail count\./)).toBeInTheDocument();
    expect(container.querySelector(".site-footer-wordmark")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".site-footer-wordmark")).toHaveTextContent("ObsidianUI");
  });

  it.each(["/docs", "/docs/installation", "/docs/magnetic-image-trail"])(
    "preserves the footer-free docs layout at %s", pathname => {
      route.pathname = pathname;
      render(<Footer />);
      expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    },
  );

  it.each(["/components", "/templates", "/project-one"])(
    "shares the new footer with %s", pathname => {
      route.pathname = pathname;
      const { container } = render(<Footer />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      expect(container.querySelector(".site-footer-wordmark")).toHaveAttribute("aria-hidden", "true");
      expect(container.querySelector(".site-footer-wordmark")).toHaveTextContent("ObsidianUI");
    },
  );
});
