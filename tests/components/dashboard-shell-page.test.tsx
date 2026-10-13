import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => true,
}));

import { DashboardShellPage } from "@/components/block/dashboard-shell-page";

const table = () => screen.getByRole("table");
const rows = () => within(table()).getAllByRole("row").slice(1);
const rowNames = () => rows().map(row => within(row).getByRole("checkbox").getAttribute("aria-label")!.replace(/^Select /, ""));
const rowFor = (name: string) => rows().find(row => within(row).queryByRole("checkbox", { name: `Select ${name}` }))!;
const sidebar = () => within(screen.getByRole("complementary")).getByRole("navigation", { name: "Navigation" });

describe("DashboardShellPage", () => {
  it("selects rows, deletes them from the floating bar, and brings them back with Undo", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);
    expect(rows()).toHaveLength(11);

    await user.click(within(rowFor("Flip Text")).getByRole("checkbox"));
    await user.click(rowFor("Text reel"));
    expect(screen.getByText("selected").parentElement).toHaveTextContent("2 selected");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(rows()).toHaveLength(9));
    expect(rowNames()).not.toContain("Flip Text");
    expect(screen.getByRole("status")).toHaveTextContent("2 components deleted");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(rowNames()).toContain("Flip Text");
    expect(rowNames()).toContain("Text reel");
    expect(rows()).toHaveLength(11);
  });

  it("selects every row in view from the header checkbox", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    const selectAll = screen.getByRole("checkbox", { name: "Select all components in view" });
    await user.click(selectAll);
    for (const row of rows()) expect(within(row).getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("selected").parentElement).toHaveTextContent("11 selected");

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(selectAll).not.toBeChecked();
  });

  it("sorts from the column headers and reverses on a second click", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    const installs = screen.getByRole("button", { name: "Installs" });
    await user.click(installs);
    expect(rowNames()[0]).toBe("Flip Text");
    expect(installs.closest("th")).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("button", { name: "Sort by: Most installs" })).toBeInTheDocument();

    await user.click(installs);
    expect(rowNames()[0]).toBe("Status Bars");
    expect(installs.closest("th")).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Component" }));
    expect(rowNames().slice(0, 2)).toEqual(["Active Sessions", "Analytics Dashboard"]);
  });

  it("stars a row and lists it under the Starred tab", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    const star = screen.getByRole("button", { name: "Star Flip Text" });
    await user.click(star);
    expect(screen.getByRole("button", { name: "Unstar Flip Text" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("tab", { name: "Starred" }));
    expect(rowNames()).toEqual(["Dashboard Shell", "Analytics Dashboard", "Art Gallery", "Flip Text"]);
  });

  it("filters the table from the sidebar and shows an empty view for other items", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    await user.click(within(sidebar()).getByRole("button", { name: /^Blocks/ }));
    expect(screen.getByRole("heading", { name: "Blocks" })).toBeInTheDocument();
    expect(rowNames()).toEqual(["Dashboard Shell", "Analytics Dashboard"]);

    await user.click(within(sidebar()).getByRole("button", { name: /^Design/ }));
    expect(rowNames()).toEqual(["Active Sessions", "Discover Button", "Split Showcase", "Flip Text"]);

    await user.click(within(sidebar()).getByRole("button", { name: "Templates" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing in Templates yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show all components" }));
    expect(rows()).toHaveLength(11);
  });

  it("copies a row's install command from its menu", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    await user.click(screen.getByRole("button", { name: "Actions for Status Bars" }));
    await user.click(await screen.findByRole("menuitem", { name: "Copy install command" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Install command for Status Bars copied"));
    expect(await navigator.clipboard.readText()).toBe("npx shadcn@latest add https://www.obsidianui.dev/r/status-bars.json");
  });

  it("adds a draft row at the top and clears the filters", async () => {
    const user = userEvent.setup();
    render(<DashboardShellPage />);

    await user.click(screen.getByRole("tab", { name: "Stable" }));
    await user.click(screen.getByRole("button", { name: "New component" }));

    expect(screen.getByRole("tab", { name: "All components" })).toHaveAttribute("aria-selected", "true");
    expect(rowNames()[0]).toBe("Untitled component");
    expect(rowFor("Untitled component")).toHaveTextContent("Draft");
  });
});
