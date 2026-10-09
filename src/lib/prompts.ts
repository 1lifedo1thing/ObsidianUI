// Kept free of path aliases: scripts/agent-docs.ts imports this module directly.
import { arixHeroPrompt } from "./prompt-content/arix-hero";

export const promptCategories = ["Hero", "Components", "Design", "Motion", "Quality", "Docs", "SEO"] as const;
export type PromptCategory = (typeof promptCategories)[number];

export type PromptBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "callout"; text: string; tone?: "info" | "tip" }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "prompt"; title: string; text: string };

export interface Prompt {
  slug: string;
  title: string;
  summary: string;
  category: PromptCategory;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  author: string;
  cover: { label: string; tone: "rose" | "red" | "blue" | "violet" | "green" | "amber" | "slate"; image?: string };
  blocks: PromptBlock[];
}

export const prompts: Prompt[] = [
  {
    slug: "arix-hero-section",
    title: "Arix Hero section",
    summary: "A scroll-driven hero where a rotating ring of tutor tiles scatters, reveals text word by word, and flies past the camera. skydrive hero recreate prompt :)",
    category: "Hero",
    date: "2026-10-09",
    author: "Atharv",
    cover: { label: "Arix Hero", tone: "rose", image: "/prompts/arix-hero-section.webp" },
    blocks: [
      { type: "callout", text: "This is the exact prompt behind the Arix hero video. Paste it into a coding agent and it builds the full page in one pass: Next.js 16, React 19, TypeScript, and plain CSS Modules, with no animation libraries. The prompt spells out the assets, the copy, the layout, the scroll math for every phase, accessibility, and Vercel deployment." },
      { type: "heading", text: "What you get" },
      {
        type: "list",
        items: [
          "**A ring of 16 character tiles** that slowly rotates around the headline and call to action.",
          "**A scroll-driven sequence:** the tiles scatter to different depths, a paragraph reveals word by word, every tile flies past the camera, and a lesson chat preview rises into view.",
          "**Reversible motion** written from one `requestAnimationFrame` loop, with a reduced-motion path that only cross-fades.",
          "**Production details:** a responsive header with a mobile menu, a skip link, focus rings, and a verification checklist the agent runs before it finishes.",
        ],
      },
      { type: "callout", tone: "tip", text: "**Recommended models:** Claude Sonnet 5 or Claude Opus 5.5. The prompt is long and precise, so a strong coding model follows the motion math most faithfully." },
      { type: "heading", text: "The prompt" },
      { type: "prompt", title: "Arix Hero section", text: arixHeroPrompt },
    ],
  },
];

export function getPrompt(slug: string) {
  return prompts.find(prompt => prompt.slug === slug);
}

/** Every "prompt" block joined, which is what the copy button and assistants receive. */
export function promptText(prompt: Prompt) {
  return prompt.blocks.filter(block => block.type === "prompt").map(block => block.text).join("\n\n---\n\n");
}

export function formatPromptDate(date: string, style: "short" | "long" = "short") {
  const value = new Date(`${date}T00:00:00Z`);
  return style === "long"
    ? value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    : value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Minutes to read the page around the prompt; the prompt itself is meant to be pasted, not read. */
export function promptReadingMinutes(prompt: Prompt) {
  const words = prompt.blocks
    .flatMap(block => {
      if (block.type === "list") return block.items;
      if (block.type === "table") return block.rows.flat();
      if (block.type === "prompt") return [];
      return [block.text];
    })
    .join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function promptMarkdown(prompt: Prompt, origin: string) {
  const body = prompt.blocks.map(block => {
    switch (block.type) {
      case "heading": return `## ${block.text}`;
      case "paragraph": return block.text;
      case "callout": return `> ${block.text}`;
      case "list": return block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${item}`).join("\n");
      case "table": return [
        `| ${block.columns.join(" | ")} |`,
        `| ${block.columns.map(() => "---").join(" | ")} |`,
        ...block.rows.map(row => `| ${row.map(cell => cell.replace(/\|/g, "\\|")).join(" | ")} |`),
      ].join("\n");
      case "prompt": {
        // The fence must be longer than any backtick run inside the prompt, which has its own code fences.
        const longest = Math.max(2, ...(block.text.match(/`+/g) ?? []).map(run => run.length));
        const fence = "`".repeat(longest + 1);
        return `### ${block.title}\n\n${fence}text\n${block.text}\n${fence}`;
      }
    }
  });
  return [
    `# ObsidianUI prompt: ${prompt.title}`,
    `${prompt.summary}`,
    `- Category: ${prompt.category}\n- Published: ${prompt.date}\n- Author: ${prompt.author}\n- Page: ${origin}/prompts/${prompt.slug}`,
    ...body,
  ].join("\n\n") + "\n";
}

export function promptsIndexMarkdown(origin: string) {
  return `# ObsidianUI prompts\n\nCopy-ready prompts for coding agents. Each prompt has a Markdown version for agents.\n\n${prompts.map(prompt => `- [${prompt.title}](${origin}/markdown/prompts/${prompt.slug}.md): ${prompt.summary}`).join("\n")}\n`;
}
