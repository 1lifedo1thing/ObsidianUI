import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { formatPromptDate, promptReadingMinutes, promptText, type Prompt, type PromptBlock } from "@/lib/prompts";
import { PromptActions, PromptCodeBlock } from "./prompt-actions";
import { InlineText, PromptCover } from "./prompt-parts";
import "./prompts.css";

const ORIGIN = "https://www.obsidianui.dev";

function Block({ block }: { block: PromptBlock }) {
  switch (block.type) {
    case "heading":
      return <h2>{block.text}</h2>;
    case "paragraph":
      return <p><InlineText text={block.text} /></p>;
    case "callout":
      return (
        <aside className={`prompt-callout is-${block.tone ?? "info"}`}>
          <p><InlineText text={block.text} /></p>
        </aside>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return <List>{block.items.map(item => <li key={item}><InlineText text={item} /></li>)}</List>;
    }
    case "table":
      return (
        <div className="prompt-table">
          <table>
            <thead><tr>{block.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
            <tbody>
              {block.rows.map(row => (
                <tr key={row.join("|")}>{row.map((cell, index) => <td key={index}><InlineText text={cell} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "prompt":
      return <PromptCodeBlock title={block.title} text={block.text} />;
  }
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.97c0-1.19-.02-2.71-1.65-2.71-1.66 0-1.91 1.29-1.91 2.63V21h-4V9.75Z" />
    </svg>
  );
}

export default function PromptDetailPage({ prompt }: { prompt: Prompt }) {
  const url = `${ORIGIN}/prompts/${prompt.slug}`;
  const minutes = promptReadingMinutes(prompt);
  return (
    <main id="main-content" className="prompts-page prompt-detail">
      <article className="prompt-doc">
        <Link href="/prompts" className="prompt-back"><ArrowLeft aria-hidden="true" /> Go back</Link>
        <div className="prompt-title-row">
          <h1>{prompt.title}</h1>
          {prompt.previewUrl ? (
            <a className="prompt-preview" href={prompt.previewUrl} target="_blank" rel="noopener noreferrer">
              Preview
              <span className="prompt-preview-icon" aria-hidden="true">
                <ArrowUpRight className="prompt-preview-arrow is-out" />
                <ArrowUpRight className="prompt-preview-arrow is-in" />
              </span>
            </a>
          ) : null}
        </div>
        <div className="prompt-byline">
          <time dateTime={prompt.date}>{formatPromptDate(prompt.date, "long")}</time>
          <span aria-hidden="true">·</span>
          <span>{minutes} minute read</span>
          <span className="prompt-pill">{prompt.category}</span>
          <span className="prompt-share-label">Share</span>
          <a className="prompt-share" href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(prompt.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><XIcon /></a>
          <a className="prompt-share" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><LinkedInIcon /></a>
        </div>
        <div className="prompt-hero-cover"><PromptCover prompt={prompt} size="lead" priority /></div>
        <PromptActions slug={prompt.slug} text={promptText(prompt)} />
        <div className="prompt-body">
          {prompt.blocks.map((block, index) => <Block key={index} block={block} />)}
        </div>
      </article>
    </main>
  );
}
