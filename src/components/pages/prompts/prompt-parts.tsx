import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { formatPromptDate, type Prompt } from "@/lib/prompts";
import { cn } from "@/lib/utils";

/** Renders the small inline subset used in prompt content: **bold** and `code`. */
export function InlineText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const token = match[0];
    parts.push(token.startsWith("**")
      ? <strong key={index}>{token.slice(2, -2)}</strong>
      : <code key={index}>{token.slice(1, -1)}</code>);
    last = index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((part, index) => <Fragment key={index}>{part}</Fragment>)}</>;
}

export function PromptMeta({ prompt, className }: { prompt: Prompt; className?: string }) {
  return (
    <p className={cn("prompts-meta", className)}>
      <time dateTime={prompt.date}>{formatPromptDate(prompt.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{prompt.category}</span>
    </p>
  );
}

export function PromptCover({ prompt, size = "card", priority = false }: { prompt: Prompt; size?: "card" | "lead"; priority?: boolean }) {
  if (prompt.cover.image) {
    return (
      <div className={cn("prompts-cover is-image", size === "lead" && "is-lead")}>
        <Image src={prompt.cover.image} alt={`${prompt.title} cover`} fill sizes="(min-width: 900px) 760px, 100vw" preload={priority} />
      </div>
    );
  }
  return (
    <div className={cn("prompts-cover", `is-${prompt.cover.tone}`, size === "lead" && "is-lead")} aria-hidden="true">
      <span className="prompts-cover-grid" />
      <span className="prompts-cover-top">
        <span>ObsidianUI</span>
        <span>{prompt.category}</span>
      </span>
      <span className="prompts-cover-label">{prompt.cover.label}</span>
    </div>
  );
}
