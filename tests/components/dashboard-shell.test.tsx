import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderKanban, ListTodo } from "lucide-react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => true,
}));

import { DashboardFilterMenu, DashboardShell, type DashboardShellNavSection, type DashboardShellProps } from "@/components/block/dashboard-shell";

const navigation: DashboardShellNavSection[] = [
  {
    id: "workspace",
    items: [
      { id: "projects", label: "Projects", icon: FolderKanban, count: 8 },
      { id: "tasks", label: "My tasks", icon: ListTodo },
    ],
  },
  { id: "spaces", title: "Spaces", items: [{ id: "website", label: "Website", color: "#facc15", href: "/spaces/website" }] },
];

function renderShell(props: Partial<DashboardShellProps> = {}) {
  return render(
    <DashboardShell brand={{ name: "Northwind", description: "Product workspace" }} navigation={navigation} title="Projects" {...props}>
      <p>Page content</p>
    </DashboardShell>,
  );
}

const sidebar = () => screen.getByRole("complementary");

describe("DashboardShell", () => {
  it("groups navigation, marks the active item, and moves it when another item is chosen", async () => {
    const user = userEvent.setup();
    const onActiveItemChange = vi.fn();
    renderShell({ onActiveItemChange, status: "Active" });

    const nav = within(sidebar()).getByRole("navigation", { name: "Navigation" });
    expect(within(nav).getByRole("button", { name: /^Projects/ })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("list", { name: "Spaces" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Website" })).toHaveAttribute("href", "/spaces/website");
    expect(screen.getByRole("region", { name: "Projects" })).toHaveTextContent("Active");

    await user.click(within(nav).getByRole("button", { name: "My tasks" }));
    expect(onActiveItemChange).toHaveBeenCalledWith("tasks");
    expect(within(nav).getByRole("button", { name: "My tasks" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("button", { name: /^Projects/ })).not.toHaveAttribute("aria-current");
  });

  it("resizes the sidebar from the keyboard within its limits", async () => {
    const user = userEvent.setup();
    const onSidebarWidthChange = vi.fn();
    renderShell({ onSidebarWidthChange });

    const handle = screen.getByRole("separator", { name: "Resize sidebar" });
    expect(handle).toHaveAttribute("aria-valuenow", "254");
    handle.focus();

    await user.keyboard("{ArrowRight}");
    expect(onSidebarWidthChange).toHaveBeenLastCalledWith(264);
    expect(handle).toHaveAttribute("aria-valuenow", "264");

    await user.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "400");
    await user.keyboard("{ArrowRight}");
    expect(onSidebarWidthChange).toHaveBeenCalledTimes(2);

    await user.keyboard("{Home}");
    expect(onSidebarWidthChange).toHaveBeenLastCalledWith(200);
    // jsdom has no pointer capture, so skip the pointer events a real double-click would send first.
    fireEvent.doubleClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "254");
  });

  it("opens the navigation drawer, keeps focus inside it, and returns focus when it closes", async () => {
    const user = userEvent.setup();
    renderShell();

    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    await user.click(menuButton);

    const drawer = screen.getByRole("dialog", { name: "Navigation" });
    const closeButton = within(drawer).getByRole("button", { name: "Close navigation" });
    expect(closeButton).toHaveFocus();
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Projects", hidden: true })).toHaveAttribute("inert");

    await user.tab({ shift: true });
    expect(within(drawer).getByRole("link", { name: "Website" })).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(menuButton).toHaveFocus();
  });

  it("closes the drawer after an item is chosen", async () => {
    const user = userEvent.setup();
    const onActiveItemChange = vi.fn();
    renderShell({ onActiveItemChange });

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "My tasks" }));

    expect(onActiveItemChange).toHaveBeenCalledWith("tasks");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveFocus();
  });

  it("labels the tabs with the page title and switches the active tab", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    renderShell({ tabs: [{ value: "all", label: "All projects" }, { value: "done", label: "Completed" }], onTabChange });

    const tablist = screen.getByRole("tablist", { name: "Projects" });
    expect(within(tablist).getByRole("tab", { name: "All projects" })).toHaveAttribute("aria-selected", "true");
    const content = screen.getByText("Page content");

    await user.click(within(tablist).getByRole("tab", { name: "Completed" }));
    expect(onTabChange).toHaveBeenCalledWith("done");
    expect(within(tablist).getByRole("tab", { name: "Completed" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Page content");
    // Switching tabs animates the content in place, so it is never remounted.
    expect(screen.getByText("Page content")).toBe(content);
  });

  it("shows the filter label and value, and changes the value from the menu", async () => {
    const user = userEvent.setup();
    function Filter() {
      const [value, setValue] = useState("updated");
      return (
        <DashboardFilterMenu
          label="Sort by"
          value={value}
          onValueChange={setValue}
          options={[{ value: "updated", label: "Last updated" }, { value: "name", label: "Name" }]}
        />
      );
    }
    render(<Filter />);

    const trigger = screen.getByRole("button", { name: "Sort by: Last updated" });
    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    // The menu portals out of the shell, so it needs the layer class to pick up the palette.
    expect(menu).toHaveClass("obsidian-dashboard-shell-layer");
    expect(within(menu).getByRole("menuitemradio", { name: "Last updated" })).toHaveAttribute("aria-checked", "true");

    await user.click(within(menu).getByRole("menuitemradio", { name: "Name" }));
    expect(screen.getByRole("button", { name: "Sort by: Name" })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
});
