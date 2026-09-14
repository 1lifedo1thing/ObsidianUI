import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { Dependencies } from "@/components/docs/component-installation";

describe("standard MDX code block copy", () => {
    beforeEach(() => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    });

    afterEach(() => { delete document.documentElement.dataset.nextraWordWrap; });

    it("provides one shared copy action and copies highlighted text without the filename", async () => {
        render(<DocsCodeBlock data-copy="" data-filename="demo.tsx" data-language="tsx">
            <code><span data-line="">{"const greeting = \"Hello\";"}</span>{"\n"}<span data-line="">{"  return greeting;"}</span></code>
        </DocsCodeBlock>);
        expect(screen.getAllByRole("button", { name: "Copy code" })).toHaveLength(1);
        expect(screen.getByText("demo.tsx")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
        await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const greeting = "Hello";\n  return greeting;'));
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
    });

    it("preserves clipboard failure feedback and allows a successful retry", async () => {
        const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
        render(<DocsCodeBlock data-copy=""><code>npm install motion</code></DocsCodeBlock>);
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Unable to copy"));
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
        expect(writeText).toHaveBeenLastCalledWith("npm install motion");
    });

    it("respects copy opt-out and retains Nextra word wrap", () => {
        render(<DocsCodeBlock data-word-wrap=""><code>const example = true;</code></DocsCodeBlock>);
        expect(screen.queryByRole("button", { name: "Copy code" })).not.toBeInTheDocument();
        fireEvent.click(screen.getByTitle("Toggle word wrap"));
        expect(document.documentElement).toHaveAttribute("data-nextra-word-wrap", "");
        fireEvent.click(screen.getByTitle("Toggle word wrap"));
        expect(document.documentElement).not.toHaveAttribute("data-nextra-word-wrap");
    });

    it("shares the installation surface without repeating the code header or copy action", async () => {
        const { rerender } = render(<DocsCodeBlock data-copy=""><code>export const value = 1;</code></DocsCodeBlock>);
        expect(screen.getByText("Code")).toBeInTheDocument();
        rerender(<Dependencies step={3} title="Add the supporting file">
            <DocsCodeBlock data-copy=""><code>export const value = 1;</code></DocsCodeBlock>
        </Dependencies>);
        expect(screen.queryByText("Code")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Add the supporting file" })).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Copy code" })).toHaveLength(1);
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
        await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("export const value = 1;"));
    });
});
