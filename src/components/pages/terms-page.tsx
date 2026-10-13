import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  CalendarSync,
  ChevronDown,
  Clock,
  Code,
  Mail,
  MessageCircle,
  Scale,
  Send,
  TriangleAlert,
  UserRoundX,
} from "lucide-react";
import { XLogo } from "@/components/site/x-logo";
import { RaisedButton } from "@/components/ui/raised-button";
import { sponsorContact } from "@/lib/sponsors";
import { termsSections, termsSummary, termsUpdated, type TermsBlock } from "@/lib/terms";
import { TermsToc } from "./terms-toc";
import "./terms-page.css";

const summaryIcons = {
  code: Code,
  user: UserRoundX,
  calendar: CalendarSync,
  message: MessageCircle,
  clock: Clock,
} as const;

const quickLinks = [
  { title: "Sponsorships", href: "#sponsorships" },
  { title: "How to cancel", href: "#cancellation" },
  { title: "Privacy", href: "#privacy" },
] as const;

const tocItems = termsSections.map(({ id, title }) => ({ id, title }));

const inlinePattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function blockText(block: TermsBlock) {
  if (block.type === "list") return block.items.join(" ");
  if (block.type === "callout") return `${block.title} ${block.text}`;
  return block.text;
}

const wordCount = termsSections
  .flatMap(section => section.blocks.map(blockText))
  .join(" ")
  .split(/\s+/).length;
const readingMinutes = Math.max(1, Math.round(wordCount / 230));

function TermsLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  if (href.startsWith("http")) return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
  return <a href={href}>{children}</a>;
}

function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(inlinePattern)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(match[1]
      ? <strong key={start}>{match[1]}</strong>
      : <TermsLink key={start} href={match[3]}>{match[2]}</TermsLink>);
    cursor = start + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function ContactActions() {
  return (
    <div className="obsidianui-terms-actions">
      <RaisedButton asChild color="#000000" className="obsidianui-terms-primary no-underline rounded-xl before:rounded-xl">
        <a href={`mailto:${sponsorContact.email}?subject=${encodeURIComponent("ObsidianUI sponsorship")}`}>
          <Mail aria-hidden="true" />
          Email
        </a>
      </RaisedButton>
      <a className="obsidianui-terms-secondary" href={sponsorContact.x} target="_blank" rel="noreferrer">
        <XLogo />
        DM on X
      </a>
      <a className="obsidianui-terms-secondary" href={sponsorContact.telegram} target="_blank" rel="noreferrer">
        <Send aria-hidden="true" />
        Telegram
      </a>
    </div>
  );
}

function Block({ block }: { block: TermsBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p><Inline text={block.text} /></p>;
    case "heading":
      return <h3>{block.text}</h3>;
    case "list":
      return (
        <ul>
          {block.items.map(item => <li key={item}><Inline text={item} /></li>)}
        </ul>
      );
    case "callout": {
      const Icon = block.tone === "warning" ? TriangleAlert : MessageCircle;
      return (
        <div className="obsidianui-terms-callout" data-tone={block.tone} role="note">
          <Icon className="obsidianui-terms-callout-icon" aria-hidden="true" />
          <div>
            <strong>{block.title}</strong>
            <p><Inline text={block.text} /></p>
            {block.contact && <ContactActions />}
          </div>
        </div>
      );
    }
  }
}

function SectionNumber({ index }: { index: number }) {
  return <span className="obsidianui-terms-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>;
}

export default function TermsPage() {
  return (
    <main id="main-content" className="obsidianui-terms">
      <section className="obsidianui-terms-hero">
        <span className="obsidianui-terms-eyebrow">
          <Scale aria-hidden="true" />
          Legal
        </span>
        <h1>Terms of Service</h1>
        <p>
          The rules for using ObsidianUI and for sponsoring it. We kept the language plain, and the details are all
          here.
        </p>
        <p className="obsidianui-terms-meta">
          <span>Last updated <time dateTime={termsUpdated.iso}>{termsUpdated.label}</time></span>
          <span className="obsidianui-terms-meta-dot" aria-hidden="true">·</span>
          <span>{readingMinutes} min read</span>
        </p>
        <nav className="obsidianui-terms-jump" aria-label="Jump to">
          {quickLinks.map(link => <a key={link.href} href={link.href}>{link.title}</a>)}
        </nav>
      </section>

      <section className="obsidianui-terms-summary" aria-labelledby="terms-summary-title">
        <div className="obsidianui-terms-summary-heading">
          <h2 id="terms-summary-title">The short version</h2>
          <p>A quick summary. The full terms below are what apply.</p>
        </div>
        <ul className="obsidianui-terms-summary-grid">
          {termsSummary.map((item, index) => {
            const Icon = summaryIcons[item.icon];
            return (
              <li key={item.title} style={{ "--i": index } as CSSProperties}>
                <Icon className="obsidianui-terms-summary-icon" aria-hidden="true" />
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="obsidianui-terms-layout">
        <aside className="obsidianui-terms-aside">
          <TermsToc items={tocItems} />
        </aside>

        <div className="obsidianui-terms-body">
          <details className="obsidianui-terms-toc-mobile">
            <summary>
              On this page
              <ChevronDown aria-hidden="true" />
            </summary>
            <ol>
              {tocItems.map((item, index) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>

          {termsSections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="obsidianui-terms-section"
              aria-labelledby={`${section.id}-title`}
            >
              <SectionNumber index={index} />
              <h2 id={`${section.id}-title`}>
                {section.title}
                <a className="obsidianui-terms-anchor" href={`#${section.id}`} aria-label={`Link to ${section.title}`}>#</a>
              </h2>
              <div className="obsidianui-terms-prose">
                {section.blocks.map((block, blockIndex) => <Block key={blockIndex} block={block} />)}
                {section.id === "contact" && <ContactActions />}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
