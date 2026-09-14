import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({
  pathname: "/",
  resolvedTheme: "light",
  setTheme: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => controls.pathname,
  useRouter: () => ({ push: controls.push }),
}));
vi.mock("next-themes", () => ({ useTheme: () => controls }));

import { SiteHeader } from "@/components/site/site-header";

async function renderHeader() {
  const rendered = render(<div onClickCapture={event => {
    // Exercise real Next links and Radix sheets without jsdom page navigation.
    if ((event.target as Element).closest("a")) event.preventDefault();
  }}><SiteHeader /></div>);
  await screen.findByRole("link", { name: "View ObsidianUI on GitHub, 42 stars" });
  return rendered;
}

describe("shared site header", () => {
  beforeEach(() => {
    controls.pathname = "/";
    controls.resolvedTheme = "light";
    controls.setTheme.mockClear();
    controls.push.mockClear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stargazers_count: 42 }),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("offers the product destinations and the correct author and GitHub links", async () => {
    await renderHeader();
    const nav = within(screen.getByRole("navigation", { name: "Main navigation" }));
    expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(nav.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");
    expect(nav.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/installation");
    expect(screen.getByRole("link", { name: "Templates" })).toHaveAttribute("href", "/templates");
    expect(screen.getByRole("link", { name: "ObsidianUI home" })).toHaveAttribute("href", "/");
    const author = screen.getByRole("link", { name: "Built by Atharv" });
    expect(author).toHaveAttribute("href", "https://athrix.me");
    expect(author).toHaveAttribute("target", "_blank");
    expect(author).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "View ObsidianUI on GitHub, 42 stars" }))
      .toHaveAttribute("href", "https://github.com/Atharvsinh-codez/ObsidianUI");
    expect(screen.getByRole("button", { name: "Open command menu" })).toBeEnabled();
  });

  it.each([
    { pathname: "/", active: "Home" },
    { pathname: "/components", active: "Components" },
    { pathname: "/docs/flip-text", active: "Docs" },
    { pathname: "/templates", active: "Templates" },
    { pathname: "/project-one", active: "Templates" },
  ])("marks $active as current at $pathname", async ({ pathname, active }) => {
    controls.pathname = pathname;
    await renderHeader();
    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
    expect(screen.getByRole("link", { current: "page" })).toHaveAccessibleName(active);
  });

  it.each([
    { current: "light", next: "dark" },
    { current: "dark", next: "light" },
  ])("switches the theme from $current to $next", async ({ current, next }) => {
    controls.resolvedTheme = current;
    const user = userEvent.setup();
    await renderHeader();
    await user.click(screen.getByRole("button", { name: "Toggle color theme" }));
    expect(controls.setTheme).toHaveBeenCalledExactlyOnceWith(next);
  });

  it("opens an accessible mobile menu, then dismisses with Escape and restores focus", async () => {
    const user = userEvent.setup();
    controls.pathname = "/docs/circle-menu";
    await renderHeader();
    const trigger = screen.getByRole("button", { name: "Open site navigation" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "ObsidianUI" });
    expect(dialog).toHaveAccessibleDescription("Explore components, documentation, and templates.");
    const nav = within(within(dialog).getByRole("navigation", { name: "Mobile site navigation" }));
    expect(nav.getAllByRole("link").map(link => link.getAttribute("href")))
      .toEqual(["/", "/components", "/docs/installation", "/templates"]);
    expect(nav.getByRole("link", { current: "page" })).toHaveAccessibleName("Docs");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes mobile navigation after selecting a destination", async () => {
    const user = userEvent.setup();
    await renderHeader();
    const trigger = screen.getByRole("button", { name: "Open site navigation" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "ObsidianUI" });
    const templates = within(dialog).getByRole("link", { name: "Templates" });
    expect(templates).toHaveAttribute("href", "/templates");
    await user.click(templates);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes mobile navigation on route changes and keeps it closed when returning", async () => {
    const user = userEvent.setup();
    const { rerender } = await renderHeader();
    await user.click(screen.getByRole("button", { name: "Open site navigation" }));
    expect(await screen.findByRole("dialog", { name: "ObsidianUI" })).toBeVisible();

    controls.pathname = "/components";
    rerender(<div><SiteHeader /></div>);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("link", { current: "page" })).toHaveAccessibleName("Components");

    controls.pathname = "/";
    rerender(<div><SiteHeader /></div>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open site navigation" })).toHaveAttribute("aria-expanded", "false");
  });
});
