import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LandingFAQ } from "@/components/landing/landing-faq";

describe("ObsidianUI landing FAQ", () => {
  it("shows product-specific groups with every answer initially collapsed", () => {
    render(<LandingFAQ />);
    const faq = screen.getByRole("region", { name: "Frequently Asked Questions" });
    expect(faq).toHaveAttribute("id", "faq");
    for (const name of ["Open Source", "Components", "Support"]) {
      expect(within(faq).getByRole("heading", { level: 3, name })).toBeVisible();
    }
    const triggers = within(faq).getAllByRole("button");
    expect(triggers).toHaveLength(11);
    for (const trigger of triggers) expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(faq).queryByRole("region")).not.toBeInTheDocument();
    expect(faq).not.toHaveTextContent(/Anywhere|Pricing|SOC 2|agent hours/i);
  });

  it("opens the selected answer and closes the previous answer across groups", async () => {
    const user = userEvent.setup();
    render(<LandingFAQ />);
    const free = screen.getByRole("button", { name: "Is ObsidianUI free and open source?" });
    const install = screen.getByRole("button", { name: "How do I add a component to my project?" });
    await user.click(free);
    expect(free).toHaveAttribute("aria-expanded", "true");
    const freeAnswer = screen.getByRole("region", { name: free.textContent! });
    expect(free).toHaveAttribute("aria-controls", freeAnswer.id);
    expect(within(freeAnswer).getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/Atharvsinh-codez/ObsidianUI");

    await user.click(install);
    expect(free).toHaveAttribute("aria-expanded", "false");
    expect(install).toHaveAttribute("aria-expanded", "true");
    const installAnswer = screen.getByRole("region", { name: install.textContent! });
    expect(within(installAnswer).getByRole("link", { name: "installation guide" })).toHaveAttribute("href", "/docs/installation");
    expect(screen.queryByRole("region", { name: free.textContent! })).not.toBeInTheDocument();
    await user.click(install);
    expect(install).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard activation and arrow, Home, and End navigation", async () => {
    const user = userEvent.setup();
    render(<LandingFAQ />);
    const questions = screen.getAllByRole("button");
    await user.tab();
    expect(questions[0]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(questions[0]).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}");
    expect(questions[1]).toHaveFocus();
    await user.keyboard(" ");
    expect(questions[1]).toHaveAttribute("aria-expanded", "true");
    expect(questions[0]).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{End}");
    expect(questions.at(-1)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(questions[0]).toHaveFocus();
  });

  it("provides nonempty answers and real product destinations for every question", async () => {
    const user = userEvent.setup();
    render(<LandingFAQ />);
    for (const trigger of screen.getAllByRole("button")) {
      await user.click(trigger);
      const panel = screen.getByRole("region", { name: trigger.textContent! });
      expect(panel.textContent!.trim().length).toBeGreaterThan(70);
      for (const link of within(panel).queryAllByRole("link")) {
        const href = link.getAttribute("href")!;
        expect(href).toMatch(/^(\/components|\/docs\/installation|https:\/\/(github\.com\/Atharvsinh-codez\/ObsidianUI|athrix\.me|x\.com\/athrix_codes))/);
      }
    }
  });
});
