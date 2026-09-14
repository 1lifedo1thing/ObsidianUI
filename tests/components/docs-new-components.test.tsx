import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({ pathname: "/docs/magnetic-image-trail" }));
vi.mock("next/navigation", () => ({ usePathname: () => controls.pathname }));

import { DocsNavigation } from "@/components/docs/docs-workspace";
import { newEffects } from "@/components/catalog/new-effects";

const STORAGE_KEY = "obsidianui:seen-new-components:v1";
const magneticHref = "/docs/magnetic-image-trail";
const arrowHref = "/docs/arrow-fill-button";

function PreventNavigation({ children }: { children: ReactNode }) {
  return <div onClick={event => {
    if ((event.target as Element).closest("a")) event.preventDefault();
  }}>{children}</div>;
}

function renderNavigation(onNavigate?: () => void) {
  return render(<PreventNavigation><DocsNavigation onNavigate={onNavigate} /></PreventNavigation>);
}

function storageChange(value: string | null, key: string | null = STORAGE_KEY) {
  if (key === null) window.localStorage.clear();
  else if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
  act(() => window.dispatchEvent(new StorageEvent("storage", { key, newValue: value, storageArea: window.localStorage })));
}

describe("new documentation component markers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    controls.pathname = magneticHref;
  });
  afterEach(() => vi.restoreAllMocks());

  it("marks exactly the 22 new effects, including the current page, and excludes older docs", async () => {
    const user = userEvent.setup();
    const { container } = renderNavigation();
    const marked = Array.from(container.querySelectorAll('.docs-nav-link[data-new="true"]'));
    expect(newEffects).toHaveLength(22);
    expect(marked.map(link => link.getAttribute("href")).sort()).toEqual(
      newEffects.map(({ slug }) => `/docs/${slug}`).sort(),
    );
    for (const link of marked) {
      expect(link.querySelector(".docs-nav-new-dot")).toHaveAttribute("data-visible", "true");
      expect(link).toHaveAccessibleName(`${link.textContent}, new component`);
    }
    for (const name of ["Flip Text", "Folder Preview", "Circle Menu", "Install Next.js"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("data-new", "false");
    }
    expect(screen.queryByRole("link", { name: /Inertia Images/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Photo Gallery" })).not.toBeInTheDocument();
    const current = screen.getByRole("link", { current: "page" });
    await user.hover(current);
    act(() => current.focus());
    expect(current).toHaveAttribute("data-new", "true");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears only the clicked dot, persists its path and still calls onNavigate", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const { container } = renderNavigation(onNavigate);
    await user.click(screen.getByRole("link", { name: "Magnetic Image Trail, new component" }));
    const clicked = screen.getByRole("link", { name: "Magnetic Image Trail" });
    expect(clicked).toHaveAttribute("data-new", "false");
    expect(clicked.querySelector(".docs-nav-new-dot")).toHaveAttribute("data-visible", "false");
    expect(container.querySelectorAll('.docs-nav-link[data-new="true"]')).toHaveLength(21);
    expect(screen.getByRole("link", { name: "Arrow Fill Button, new component" })).toHaveAttribute("data-new", "true");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([magneticHref]);
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("restores persisted visits after the navigation remounts", async () => {
    const user = userEvent.setup();
    const first = renderNavigation();
    await user.click(screen.getByRole("link", { name: "Arrow Fill Button, new component" }));
    first.unmount();
    renderNavigation();
    expect(screen.getByRole("link", { name: "Arrow Fill Button" })).toHaveAttribute("data-new", "false");
    expect(screen.getByRole("link", { name: "Magnetic Image Trail, new component" })).toHaveAttribute("data-new", "true");
  });

  it("updates every mounted navigation instance when one link is clicked", async () => {
    const user = userEvent.setup();
    render(<PreventNavigation><DocsNavigation /><DocsNavigation /></PreventNavigation>);
    const [desktop, mobile] = screen.getAllByRole("navigation", { name: "Documentation" });
    await user.click(within(mobile).getByRole("link", { name: "Magnetic Image Trail, new component" }));
    for (const nav of [desktop, mobile]) {
      expect(within(nav).getByRole("link", { name: "Magnetic Image Trail" })).toHaveAttribute("data-new", "false");
      expect(within(nav).getByRole("link", { name: "Arrow Fill Button, new component" })).toHaveAttribute("data-new", "true");
    }
  });

  it("synchronizes visits and clearing from another tab while ignoring other storage keys", () => {
    renderNavigation();
    storageChange(JSON.stringify([magneticHref]));
    expect(screen.getByRole("link", { name: "Magnetic Image Trail" })).toHaveAttribute("data-new", "false");
    storageChange(JSON.stringify([arrowHref]), "another-preference");
    expect(screen.getByRole("link", { name: "Arrow Fill Button, new component" })).toHaveAttribute("data-new", "true");
    storageChange(null, null);
    expect(screen.getByRole("link", { name: "Magnetic Image Trail, new component" })).toHaveAttribute("data-new", "true");
  });

  it("supports keyboard activation and does not record ordinary documentation links", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderNavigation(onNavigate);
    const link = screen.getByRole("link", { name: "Arrow Fill Button, new component" });
    act(() => link.focus());
    await user.keyboard("{Enter}");
    expect(link).toHaveAttribute("data-new", "false");
    await user.click(screen.getByRole("link", { name: "Flip Text" }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([arrowHref]);
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it("ignores malformed or unknown stored entries and accepts only known new component paths", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not-json");
    const { container } = renderNavigation();
    expect(container.querySelectorAll('.docs-nav-link[data-new="true"]')).toHaveLength(22);
    storageChange(JSON.stringify({ seen: [magneticHref] }));
    expect(container.querySelectorAll('.docs-nav-link[data-new="true"]')).toHaveLength(22);
    storageChange(JSON.stringify([magneticHref, magneticHref, "/docs/flip-text", "__proto__", 42, null]));
    expect(container.querySelectorAll('.docs-nav-link[data-new="true"]')).toHaveLength(21);
    expect(screen.getByRole("link", { name: "Magnetic Image Trail" })).toHaveAttribute("data-new", "false");
  });

  it("renders no unread dots on the server before browser preferences are known", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([magneticHref]));
    const html = renderToString(<DocsNavigation />);
    expect(html).not.toContain('data-new="true"');
    expect(html).not.toContain('data-visible="true"');
    expect(html).not.toContain(", new component");
  });

  it("keeps visits in memory when storage reads and writes are blocked", () => {
    const first = renderNavigation();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    fireEvent.click(screen.getByRole("link", { name: "Magnetic Image Trail, new component" }));
    expect(screen.getByRole("link", { name: "Magnetic Image Trail" })).toHaveAttribute("data-new", "false");
    first.unmount();
    renderNavigation();
    expect(screen.getByRole("link", { name: "Magnetic Image Trail" })).toHaveAttribute("data-new", "false");
    expect(screen.getByRole("link", { name: "Arrow Fill Button, new component" })).toHaveAttribute("data-new", "true");
  });
});
