"use client";

// Adapted from EvilCharts' docs-copy-button. See THIRD_PARTY_NOTICES.md.
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AnimatedCopyIcon } from "@/components/docs/animated-copy-icon";
import { ChatGPTIcon, ClaudeIcon } from "@/components/docs/assistant-icons";
import { useCopy } from "@/components/docs/use-copy";
import { cn } from "@/lib/utils";
import "./docs-copy-page.css";

export function DocsCopyPage({ sourceCode, pathname }: { sourceCode: string; pathname: string }) {
  const { copy, hasCopied, status } = useCopy();
  const reduceMotion = useReducedMotion();
  const canonicalUrl = `https://www.obsidianui.dev${pathname}`;

  return (
    <div className="docs-page-actions">
      <div className="docs-page-copy-group">
        <Button asChild variant="secondary" size="sm" className="docs-page-copy-button" aria-label="Copy page" onClick={() => copy(sourceCode, {
          eventName: "docs_page_copied",
          properties: { path: pathname },
        })}>
          <motion.button whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={{ duration: 0.15 }}>
            <AnimatedCopyIcon copied={hasCopied} />
            <span className="docs-page-copy-label" aria-hidden="true">
              <span className={cn("docs-page-copy-idle", hasCopied && "is-hidden")}>Copy Page</span>
              <span className={cn("docs-page-copy-success", hasCopied && "is-visible")}>Copied</span>
            </span>
          </motion.button>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Open page actions" className="docs-page-menu-trigger">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path fill="currentColor" d="M3 6l5 5 5-5H3z" /></svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="obsidian-docs docs-page-menu" aria-label="Page actions">
            {Object.entries(menuItems).map(([key, renderLink]) => (
              <DropdownMenuItem asChild className="docs-page-menu-item" key={key}>
                {renderLink(canonicalUrl, pathname)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span role="status" className={cn("docs-page-copy-status", !status.startsWith("Unable") && "sr-only")}>{status}</span>
    </div>
  );
}

function getPromptUrl(baseURL: string, url: string) {
  return `${baseURL}?q=${encodeURIComponent(
    `I’m looking at this ObsidianUI documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
  `,
  )}`;
}

const menuItems = {
  // Markdown stays on this host; external assistants receive the public URL.
  markdown: (_url: string, path: string) => (
    <a href={`/api${path}/markdown`} target="_blank" rel="noopener noreferrer">
      <svg aria-hidden="true" strokeLinejoin="round" viewBox="0 0 22 16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.5 2.25H2.5C1.80964 2.25 1.25 2.80964 1.25 3.5V12.5C1.25 13.1904 1.80964 13.75 2.5 13.75H19.5C20.1904 13.75 20.75 13.1904 20.75 12.5V3.5C20.75 2.80964 20.1904 2.25 19.5 2.25ZM2.5 1C1.11929 1 0 2.11929 0 3.5V12.5C0 13.8807 1.11929 15 2.5 15H19.5C20.8807 15 22 13.8807 22 12.5V3.5C22 2.11929 20.8807 1 19.5 1H2.5ZM3 4.5H4H4.25H4.6899L4.98715 4.82428L7 7.02011L9.01285 4.82428L9.3101 4.5H9.75H10H11V5.5V11.5H9V7.79807L7.73715 9.17572L7 9.97989L6.26285 9.17572L5 7.79807V11.5H3V5.5V4.5ZM15 8V4.5H17V8H19.5L17 10.5L16 11.5L15 10.5L12.5 8H15Z"
          fill="currentColor"
        />
      </svg>
      View as Markdown
    </a>
  ),
  v0: (url: string) => (
    <a href={getPromptUrl("https://v0.dev", url)} target="_blank" rel="noopener noreferrer">
      <svg aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 147 70"
        className="size-4.5 -translate-x-px"
      >
        <path d="M56 50.203V14h14v46.156C70 65.593 65.593 70 60.156 70c-2.596 0-5.158-1-7-2.843L0 14h19.797L56 50.203ZM147 56h-14V23.953L100.953 56H133v14H96.687C85.814 70 77 61.186 77 50.312V14h14v32.156L123.156 14H91V0h36.312C138.186 0 147 8.814 147 19.688V56Z" />
      </svg>
      <span className="-translate-x-[2px]">Open in v0</span>
    </a>
  ),
  chatgpt: (url: string) => (
    <a href={getPromptUrl("https://chatgpt.com", url)} target="_blank" rel="noopener noreferrer">
      <ChatGPTIcon />
      Open in ChatGPT
    </a>
  ),
  claude: (url: string) => (
    <a href={getPromptUrl("https://claude.ai/new", url)} target="_blank" rel="noopener noreferrer">
      <ClaudeIcon />
      Open in Claude
    </a>
  ),
  scira: (url: string) => (
    <a href={getPromptUrl("https://scira.ai/", url)} target="_blank" rel="noopener noreferrer" className="m-0 p-0">
      <svg aria-hidden="true"
        width="910"
        height="934"
        viewBox="0 0 910 934"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M516.774 304.217C510.299 275.491 498.208 252.087 480.335 234.214C462.462 216.341 439.058 204.251 410.333 197.775C439.059 191.3 462.462 179.209 480.335 161.336C498.208 143.463 510.299 120.06 516.774 91.334C523.25 120.059 535.34 143.463 553.213 161.336C571.086 179.209 594.49 191.3 623.216 197.775C594.49 204.251 571.086 216.341 553.213 234.214C535.34 252.087 523.25 275.491 516.774 304.217Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M857.5 508.116C763.259 497.644 710.903 445.288 700.432 351.047C689.961 445.288 637.605 497.644 543.364 508.116C637.605 518.587 689.961 570.943 700.432 665.184C710.903 570.943 763.259 518.587 857.5 508.116Z"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinejoin="round"
        />
        <path
          d="M700.432 615.957C691.848 589.05 678.575 566.357 660.383 548.165C642.191 529.973 619.499 516.7 592.593 508.116C619.499 499.533 642.191 486.258 660.383 468.066C678.575 449.874 691.848 427.181 700.432 400.274C709.015 427.181 722.289 449.874 740.481 468.066C758.673 486.258 781.365 499.533 808.271 508.116C781.365 516.7 758.673 529.973 740.481 548.165C722.289 566.357 709.015 589.05 700.432 615.957Z"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinejoin="round"
        />
        <path
          d="M889.949 121.237C831.049 114.692 798.326 81.9698 791.782 23.0692C785.237 81.9698 752.515 114.692 693.614 121.237C752.515 127.781 785.237 160.504 791.782 219.404C798.326 160.504 831.049 127.781 889.949 121.237Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M791.782 196.795C786.697 176.937 777.869 160.567 765.16 147.858C752.452 135.15 736.082 126.322 716.226 121.237C736.082 116.152 752.452 107.324 765.16 94.6152C777.869 81.9065 786.697 65.5368 791.782 45.6797C796.867 65.5367 805.695 81.9066 818.403 94.6152C831.112 107.324 847.481 116.152 867.338 121.237C847.481 126.322 831.112 135.15 818.403 147.858C805.694 160.567 796.867 176.937 791.782 196.795Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442"
          stroke="currentColor"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Open in Scira
    </a>
  ),
};


