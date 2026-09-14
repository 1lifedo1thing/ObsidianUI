import { act, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dependencies } from "@/components/docs/component-installation";
import { ExpandableBlock } from "@/components/docs/expandable-block";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import hoverImageRegistry from "../../public/r/hover-img.json";
import dottedGridRegistry from "../../public/r/dotted-grid.json";

vi.mock("motion/react", async importOriginal => ({
    ...await importOriginal<typeof import("motion/react")>(),
    useReducedMotion: () => true,
}));

const sourceFiles = [
    { step: 2, title: "Copy the source code", language: "tsx", path: "components/block/hover-img.tsx" },
    { step: 3, title: "Add the CSS file", language: "css", path: "components/block/hover-img.css" },
].map(source => {
    const file = hoverImageRegistry.files.find(file => file.path === source.path);
    if (!file) throw new Error(`Missing Hover Image registry file: ${source.path}`);
    return { ...source, content: file.content };
});

const utilsFile = dottedGridRegistry.files.find(file => file.path === "lib/utils.ts");
if (!utilsFile) throw new Error("Missing shared utility registry file");
const manualFiles = [...sourceFiles, {
    step: 4,
    title: "Add the shared utility",
    language: "ts",
    path: utilsFile.path,
    content: utilsFile.content,
}];

describe("Hover Image manual source cards", () => {
    let resizeCallbacks: Set<() => void>;

    beforeEach(() => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
        resizeCallbacks = new Set();
        vi.stubGlobal("ResizeObserver", class {
            notify: () => void;
            constructor(callback: ResizeObserverCallback) {
                this.notify = () => callback([], this as unknown as ResizeObserver);
                resizeCallbacks.add(this.notify);
            }
            observe() {}
            disconnect() { resizeCallbacks.delete(this.notify); }
        });
        const originalBounds = HTMLElement.prototype.getBoundingClientRect;
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
            const bounds = originalBounds.call(this);
            if (this.classList.contains("docs-expandable-content")) {
                return { ...bounds, height: (this.querySelector("code")?.textContent?.split("\n").length ?? 0) * 20 + 32 };
            }
            if (this.classList.contains("docs-expandable-limit")) {
                return { ...bounds, height: parseFloat(this.style.height) };
            }
            return bounds;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("copies complete canonical files with long cards collapsed and the short utility at natural height", async () => {
        const { container } = render(<>
            {manualFiles.map(source => (
                <Dependencies key={source.path} id={`hover-img-${source.language}`} step={source.step} title={source.title} className="docs-source-card">
                    <p>Copy into <code>{source.path}</code></p>
                    <ExpandableBlock>
                        <DocsCodeBlock data-copy="" data-language={source.language}>
                            <code>{source.content}</code>
                        </DocsCodeBlock>
                    </ExpandableBlock>
                </Dependencies>
            ))}
        </>);
        act(() => resizeCallbacks.forEach(notify => notify()));

        expect(within(container).getAllByRole("button", { name: "Copy code" })).toHaveLength(manualFiles.length);
        for (const [index, source] of manualFiles.entries()) {
            const card = container.querySelector<HTMLElement>(`#hover-img-${source.language}`)!;
            const controls = within(card);
            expect(controls.getAllByRole("button", { name: "Copy code" })).toHaveLength(1);
            const expand = controls.queryByRole("button", { name: "Show More" });
            if (source.path === "lib/utils.ts") {
                expect(expand).not.toBeInTheDocument();
                expect(card.querySelector(".docs-expandable-fade")).not.toBeInTheDocument();
                expect(card.querySelector(".docs-expandable-content")?.parentElement).toHaveStyle({ height: "auto" });
            } else {
                expect(expand).toHaveAttribute("aria-expanded", "false");
                await waitFor(() => expect(document.getElementById(expand!.getAttribute("aria-controls")!)).toHaveStyle({ height: "400px" }));
            }

            fireEvent.click(controls.getByRole("button", { name: "Copy code" }));
            await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenNthCalledWith(index + 1, source.content));
            if (expand) expect(expand).toHaveAttribute("aria-expanded", "false");
            expect(card.querySelector("pre code")?.textContent).toBe(source.content);
        }
    });
});
