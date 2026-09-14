import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import navigation from "../src/content/_meta";
import { GET as markdownGET } from "../src/app/api/docs/[slug]/markdown/route";
import { createDocumentationMarkdownHandler } from "../src/lib/server/docs-markdown";

const request = (slug: string) => new Request(`http://localhost/api/docs/${encodeURIComponent(slug)}/markdown`);
const context = (slug: string) => ({ params: Promise.resolve({ slug }) });

test("every published documentation page serves its generated clean content as inline markdown", async () => {
  const loadSource = (slug: string) => readFile(path.join(process.cwd(), "public", "markdown", "docs", `${slug}.md`), "utf8");
  const published = Object.entries(navigation).filter(([, entry]) => typeof entry === "string");

  for (const [slug] of published) {
    const response = await markdownGET(request(slug), context(slug));
    assert.equal(response.status, 200, slug);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("content-disposition"), `inline; filename="${slug}.md"`);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(await response.text(), `${(await loadSource(slug)).trim()}\n`, slug);
  }
});

test("unknown, removed, hidden and path-like slugs return markdown 404s without loading source", async () => {
  let calls = 0;
  const GET = createDocumentationMarkdownHandler(async () => { calls++; return "# Unexpected"; });

  for (const slug of ["missing-page", "photo-gallery", "inertia-img", "animated-faq", "animated-tabs", "testimonial-swiper", "staggered-grid", "depth-card-stack", "animated-modal", "ai-input", "spotlight-navbar", "index", "---1", "constructor", "__proto__", "../installation", "installation/extra", "..%2Finstallation"]) {
    const response = await GET(request(slug), context(slug));
    assert.equal(response.status, 404, slug);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(await response.text(), /\[Browse the ObsidianUI documentation\]\(\/docs\/installation\)/);
  }
  assert.equal(calls, 0);
});

test("source loading errors and empty source do not become successful or missing pages", async () => {
  for (const loadSource of [async () => { throw new Error("private build details"); }, async () => "\n "]) {
    const GET = createDocumentationMarkdownHandler(loadSource);
    const response = await GET(request("installation"), context("installation"));
    assert.equal(response.status, 500);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.text();
    assert.match(body, /temporarily unavailable/);
    assert.doesNotMatch(body, /private build details/);
  }
});
