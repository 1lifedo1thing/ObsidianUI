import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({ push: vi.fn(), setTheme: vi.fn(), reducedMotion: false }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: controls.push }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: controls.setTheme }) }));
vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useReducedMotion: () => controls.reducedMotion,
}));

import { CommandMenu } from "@/components/site/command-menu";

async function openSearch() {
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Open command menu" });
  await user.click(trigger);
  const input = await screen.findByRole("combobox", { name: "Search components and commands" });
  await waitFor(() => expect(input).toHaveFocus());
  return { user, trigger, input };
}

describe("animated command menu", () => {
  beforeEach(() => {
    controls.push.mockClear();
    controls.setTheme.mockClear();
    controls.reducedMotion = false;
    // cmdk scrolls the selected result into view; jsdom has no layout scrolling.
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("focuses search, traps Tab, then restores trigger focus after Escape", async () => {
    render(<><CommandMenu /><button>Outside action</button></>);
    const { user, trigger, input } = await openSearch();
    expect(screen.getByRole("dialog", { name: "Search ObsidianUI" }))
      .toHaveAccessibleDescription("Find components and pages, or change your theme.");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab({ shift: true });
    expect(input).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("filters component results and selects the next one with the keyboard", async () => {
    render(<CommandMenu />);
    const { user, input } = await openSearch();
    await user.type(input, "scroll");
    const matches = screen.getAllByRole("option");
    expect(matches.length).toBeGreaterThan(1);
    expect(screen.queryByRole("option", { name: "Home" })).not.toBeInTheDocument();
    expect(matches.some(option => option.textContent?.toLowerCase().includes("scroll"))).toBe(true);
    const destination = matches[1].getAttribute("data-value")?.split(" ").at(-1);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(controls.push).toHaveBeenCalledExactlyOnceWith(destination);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes on the backdrop and returns focus", async () => {
    render(<CommandMenu />);
    const { user, trigger } = await openSearch();
    const dialog = screen.getByRole("dialog");
    const overlay = dialog.previousElementSibling;
    expect(overlay).not.toBeNull();
    await user.click(overlay!);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("opens with Ctrl+K and restores the previously focused control", async () => {
    render(<><CommandMenu /><button>Outside action</button></>);
    const user = userEvent.setup();
    const outside = screen.getByRole("button", { name: "Outside action" });
    await user.click(outside);
    await user.keyboard("{Control>}k{/Control}");
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
    await user.keyboard("{Control>}k{/Control}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(outside).toHaveFocus());
  });

  it("can reopen during its exit without losing focus or leaving a duplicate dialog", async () => {
    render(<CommandMenu />);
    const { trigger } = await openSearch();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    expect(screen.getByRole("combobox")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("supports controlled state and theme commands", async () => {
    function ControlledMenu() {
      const [open, setOpen] = useState(false);
      return <CommandMenu open={open} onOpenChange={setOpen} />;
    }
    render(<ControlledMenu />);
    const { user, input } = await openSearch();
    await user.type(input, "Dark");
    await user.click(screen.getByRole("option", { name: "Dark" }));
    expect(controls.setTheme).toHaveBeenCalledExactlyOnceWith("dark");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("keeps local state when a change listener is supplied without a controlled value", async () => {
    const onOpenChange = vi.fn();
    render(<CommandMenu onOpenChange={onOpenChange} />);
    const { user } = await openSearch();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("opens and dismisses without spatial motion when reduced motion is requested", async () => {
    controls.reducedMotion = true;
    render(<CommandMenu />);
    const { user, trigger } = await openSearch();
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.transform).toBe("none");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
