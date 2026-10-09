"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { formatPromptDate, promptCategories, prompts, type Prompt, type PromptCategory } from "@/lib/prompts";
import { InlineText, PromptCover, PromptMeta } from "./prompt-parts";
import "./prompts.css";

const PAGE_SIZE = 8;

function PromptCard({ prompt, lead = false, solo = false }: { prompt: Prompt; lead?: boolean; solo?: boolean }) {
  const Heading = lead ? "h2" : "h3";
  if (solo) {
    return (
      <article className="prompts-card is-lead is-solo">
        <Link href={`/prompts/${prompt.slug}`} className="prompts-solo-cover" tabIndex={-1} aria-hidden="true">
          <PromptCover prompt={prompt} size="lead" priority />
        </Link>
        <div className="prompts-solo-body">
          <Link href={`/prompts/${prompt.slug}`} className="prompts-card-link">
            <Heading className="prompts-card-title">{prompt.title}</Heading>
          </Link>
          <PromptMeta prompt={prompt} />
          <p className="prompts-card-summary"><InlineText text={prompt.summary} /></p>
          <Link href={`/prompts/${prompt.slug}`} className="prompts-learn" aria-label={`Read prompt: ${prompt.title}`}>
            Read prompt <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }
  return (
    <article className={lead ? "prompts-card is-lead" : "prompts-card"}>
      <Link href={`/prompts/${prompt.slug}`} className="prompts-card-link">
        <PromptCover prompt={prompt} size={lead ? "lead" : "card"} />
        <Heading className="prompts-card-title">{prompt.title}</Heading>
      </Link>
      <PromptMeta prompt={prompt} />
      <p className="prompts-card-summary"><InlineText text={prompt.summary} /></p>
      <Link href={`/prompts/${prompt.slug}`} className="prompts-learn" aria-label={`Read prompt: ${prompt.title}`}>
        Read prompt <ArrowRight aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function PromptsPage() {
  const [category, setCategory] = useState<PromptCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const [lead, ...rest] = prompts;
  const featured = rest.slice(0, 6);

  const usedCategories = promptCategories.filter(name => prompts.some(prompt => prompt.category === name));
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prompts.filter(prompt =>
      (category === "All" || prompt.category === category) &&
      (!needle || `${prompt.title} ${prompt.summary} ${prompt.author}`.toLowerCase().includes(needle)));
  }, [category, query]);
  const shown = filtered.slice(0, visible);

  return (
    <main id="main-content" className="prompts-page">
      <div className="prompts-shell">
        <header className="prompts-intro">
          <h1>Prompts</h1>
          <p>Copy-ready prompts for coding agents. Open any of them in Factory, ChatGPT, Claude, Grok, or Gemini, or hand the Markdown file to your agent.</p>
        </header>

        <section className={featured.length ? "prompts-featured" : "prompts-featured is-solo"} aria-label="Featured prompts">
          <PromptCard prompt={lead} lead solo={!featured.length} />
          {featured.length ? (
            <div className="prompts-featured-grid">
              {featured.map(prompt => <PromptCard key={prompt.slug} prompt={prompt} />)}
            </div>
          ) : null}
        </section>

        <section className="prompts-index" aria-labelledby="prompts-index-title">
          <h2 id="prompts-index-title" className="sr-only">All prompts</h2>
          <div className="prompts-filters">
            <button
              type="button"
              className="prompts-chip is-icon"
              aria-label={searchOpen ? "Close search" : "Search prompts"}
              aria-expanded={searchOpen}
              onClick={() => {
                const next = !searchOpen;
                setSearchOpen(next);
                if (next) requestAnimationFrame(() => searchRef.current?.focus());
                else setQuery("");
              }}
            >
              {searchOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
            </button>
            {searchOpen ? (
              <input
                ref={searchRef}
                type="search"
                className="prompts-search"
                placeholder="Search prompts"
                aria-label="Search prompts"
                value={query}
                onChange={event => { setQuery(event.target.value); setVisible(PAGE_SIZE); }}
                onKeyDown={event => { if (event.key === "Escape") { setQuery(""); setSearchOpen(false); } }}
              />
            ) : null}
            <div className="prompts-chip-row" role="group" aria-label="Filter by category">
              {(["All", ...usedCategories] as const).map(name => (
                <button
                  key={name}
                  type="button"
                  className="prompts-chip"
                  aria-pressed={category === name}
                  onClick={() => { setCategory(name); setVisible(PAGE_SIZE); }}
                >
                  {name === "All" ? "All prompts" : name}
                </button>
              ))}
            </div>
          </div>

          {shown.length ? (
            <ul className="prompts-list">
              {shown.map(prompt => (
                <li key={prompt.slug}>
                  <Link href={`/prompts/${prompt.slug}`} className="prompts-row">
                    <span className="prompts-row-meta">
                      <time dateTime={prompt.date}>{formatPromptDate(prompt.date)}</time>
                      <span aria-hidden="true"> · </span>{prompt.category}
                    </span>
                    <span className="prompts-row-title">{prompt.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="prompts-empty" role="status">No prompts match. Try another category or search.</p>
          )}

          {filtered.length > visible ? (
            <div className="prompts-more">
              <button type="button" className="prompts-chip is-more" onClick={() => setVisible(count => count + PAGE_SIZE)}>View more</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
