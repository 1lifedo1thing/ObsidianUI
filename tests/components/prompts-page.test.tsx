import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PromptsPage from "@/components/pages/prompts/prompts-page";
import { PromptActions } from "@/components/pages/prompts/prompt-actions";
import { prompts, promptText } from "@/lib/prompts";

describe("prompts page", () => {
  it("features the Arix prompt and filters the list by category and search", async () => {
    const user = userEvent.setup();
    render(<PromptsPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Arix Hero section" })).toBeInTheDocument();
    const list = () => screen.getByRole("list");
    expect(within(list()).getAllByRole("link")).toHaveLength(prompts.length);

    await user.click(screen.getByRole("button", { name: "Hero" }));
    expect(screen.getByRole("button", { name: "Hero" })).toHaveAttribute("aria-pressed", "true");
    expect(within(list()).getByRole("link", { name: /Arix Hero section/ })).toHaveAttribute("href", "/prompts/arix-hero-section");

    await user.click(screen.getByRole("button", { name: "Search prompts" }));
    await user.type(screen.getByRole("searchbox", { name: "Search prompts" }), "zzz");
    expect(screen.getByRole("status")).toHaveTextContent("No prompts match");
  });

  it("offers every assistant and the Markdown file", async () => {
    const user = userEvent.setup();
    render(<PromptActions slug="arix-hero-section" text="Build the hero" />);
    await user.click(screen.getByRole("button", { name: /Open in/ }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Open in Claude/ })).toHaveAttribute("href", "https://claude.ai/new?q=Build%20the%20hero");
    expect(within(menu).getByRole("menuitem", { name: /Open in ChatGPT/ })).toHaveAttribute("href", "https://chatgpt.com/?q=Build%20the%20hero");
    expect(within(menu).getByRole("menuitem", { name: /Open in Grok/ })).toHaveAttribute("href", "https://grok.com/?q=Build%20the%20hero");
    expect(within(menu).getByRole("menuitem", { name: /Open in Factory/ })).toHaveAttribute("href", "https://app.factory.ai");
    expect(within(menu).getByRole("menuitem", { name: /Open in Gemini/ })).toHaveAttribute("href", "https://gemini.google.com/app");
    expect(within(menu).getByRole("menuitem", { name: "Markdown for agents" })).toHaveAttribute("href", "/markdown/prompts/arix-hero-section.md");
  });

  it("links long prompts to their Markdown file instead of overflowing the URL", async () => {
    const user = userEvent.setup();
    const arix = prompts.find(prompt => prompt.slug === "arix-hero-section")!;
    render(<PromptActions slug={arix.slug} text={promptText(arix)} />);
    await user.click(screen.getByRole("button", { name: /Open in/ }));
    const href = (await screen.findByRole("menuitem", { name: /Open in Claude/ })).getAttribute("href")!;
    expect(decodeURIComponent(href)).toContain("https://www.obsidianui.dev/markdown/prompts/arix-hero-section.md");
  });
});
