import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock("motion/react", async (importOriginal) => ({
    ...await importOriginal<typeof import("motion/react")>(),
    useReducedMotion: () => preferences.reduced,
}));

import { ComponentPreview } from "@/components/docs/component-preview";
import { CLICommand } from "@/components/docs/cli-command";

describe("documentation preview and command controls", () => {
    beforeEach(() => {
        preferences.reduced = false;
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    });

    it("keeps previews full width without viewport options and reloads the live component", () => {
        function Counter() {
            const [count, setCount] = useState(0);
            return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
        }
        const { container } = render(<ComponentPreview component={<Counter />} code="<Counter />" />);
        expect(screen.queryByRole("button", { name: /narrow|mobile|full width/i })).not.toBeInTheDocument();
        expect(container.querySelector(".docs-preview-body")?.parentElement).toHaveClass("w-full");
        fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
        expect(screen.getByRole("button", { name: "Count 1" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Reload component" }));
        expect(screen.getByRole("button", { name: "Count 0" })).toBeInTheDocument();
    });

    it("keeps preview tabs keyboard accessible and copies the exact example", async () => {
        const user = userEvent.setup();
        vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
        render(<ComponentPreview component={<p>Live example</p>} code={'<Demo title="Hello" />'} />);
        await user.click(screen.getByRole("tab", { name: "preview" }));
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "code" })).toHaveAttribute("aria-selected", "true");
        expect(screen.queryByRole("button", { name: "Reload component" })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Copy example code" }));
        await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<Demo title="Hello" />'));
        expect(screen.getAllByRole("status").some(element => element.textContent === "Copied")).toBe(true);
    });

    it("copies the selected package manager command after pointer and keyboard changes", async () => {
        const user = userEvent.setup();
        vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
        render(<CLICommand componentName="circle-menu" />);
        await user.click(screen.getByRole("tab", { name: "pnpm" }));
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "bun" })).toHaveAttribute("aria-selected", "true");
        await user.click(screen.getByRole("button", { name: "Copy command" }));
        await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('bunx shadcn@latest add "https://www.obsidianui.dev/r/circle-menu.json"'));
    });

    it("shows previews immediately with reduced motion and keeps reload available", () => {
        preferences.reduced = true;
        const { container } = render(<ComponentPreview component={<p>Still preview</p>} code="<Demo />" />);
        expect(container.querySelector(".docs-preview-body")).toHaveStyle({ opacity: "1", transform: "none" });
        fireEvent.click(screen.getByRole("button", { name: "Reload component" }));
        expect(screen.getByText("Still preview")).toBeInTheDocument();
        expect(container.querySelector(".docs-preview-body")).toHaveStyle({ opacity: "1", transform: "none" });
    });
});
