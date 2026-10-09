"use client";

import { Check, ChevronDown, Copy, FileText } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChatGPTIcon, ClaudeIcon, FactoryIcon, GeminiIcon, GrokIcon } from "@/components/docs/assistant-icons";
import { useCopy } from "@/components/docs/use-copy";

const ORIGIN = "https://www.obsidianui.dev";
// Long prompts are sent as a link to their Markdown file so the URL stays well under browser limits.
const MAX_QUERY_LENGTH = 6000;

type Assistant = {
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Assistants with a documented ?q= prefill. Others get the prompt on the clipboard. */
  queryUrl?: string;
  appUrl: string;
};

const assistants: Assistant[] = [
  { name: "Factory", Icon: FactoryIcon, appUrl: "https://app.factory.ai" },
  { name: "ChatGPT", Icon: ChatGPTIcon, queryUrl: "https://chatgpt.com/", appUrl: "https://chatgpt.com/" },
  { name: "Claude", Icon: ClaudeIcon, queryUrl: "https://claude.ai/new", appUrl: "https://claude.ai/new" },
  { name: "Grok", Icon: GrokIcon, queryUrl: "https://grok.com/", appUrl: "https://grok.com/" },
  { name: "Gemini", Icon: GeminiIcon, appUrl: "https://gemini.google.com/app" },
];

function assistantUrl(assistant: Assistant, text: string, markdownUrl: string) {
  if (!assistant.queryUrl) return assistant.appUrl;
  const message = text.length > MAX_QUERY_LENGTH
    ? `Read ${markdownUrl} and follow the prompt in it. Ask me for any [ placeholders ] first.`
    : text;
  return `${assistant.queryUrl}?q=${encodeURIComponent(message)}`;
}

export function PromptActions({ slug, text }: { slug: string; text: string }) {
  const { copy, hasCopied, status } = useCopy();
  const markdownPath = `/markdown/prompts/${slug}.md`;
  const markdownUrl = `${ORIGIN}${markdownPath}`;

  return (
    <div className="prompt-actions">
      <button type="button" className="prompt-action is-primary" onClick={() => copy(text)}>
        {hasCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {hasCopied ? "Copied" : "Copy prompt"}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="prompt-action">
            Open in <ChevronDown aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="prompt-menu">
          {assistants.map(assistant => (
            <DropdownMenuItem key={assistant.name} asChild className="prompt-menu-item">
              <a
                href={assistantUrl(assistant, text, markdownUrl)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { if (!assistant.queryUrl) void copy(text); }}
              >
                <assistant.Icon />
                <span>Open in {assistant.name}</span>
                {!assistant.queryUrl ? <span className="prompt-menu-hint">copies prompt</span> : null}
              </a>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="prompt-menu-item">
            <a href={markdownPath} target="_blank" rel="noopener noreferrer">
              <FileText aria-hidden="true" />
              <span>Markdown for agents</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <a className="prompt-action is-quiet" href={markdownPath} target="_blank" rel="noopener noreferrer">
        <FileText aria-hidden="true" /> {`${slug}.md`}
      </a>
      <span role="status" className={status.startsWith("Unable") ? "prompt-status" : "sr-only"}>{status}</span>
    </div>
  );
}

export function PromptCodeBlock({ title, text }: { title: string; text: string }) {
  const { copy, hasCopied } = useCopy();
  return (
    <figure className="prompt-code">
      <figcaption>
        <span>{title}</span>
        <button type="button" onClick={() => copy(text)} aria-label={hasCopied ? `${title} copied` : `Copy ${title}`}>
          {hasCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {hasCopied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre><code>{text}</code></pre>
    </figure>
  );
}
