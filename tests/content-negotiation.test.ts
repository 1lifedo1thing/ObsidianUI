import assert from "node:assert/strict";
import test from "node:test";
import { acceptsMarkdown, acceptsReactStream, appendVary, negotiateDocument } from "../src/lib/agent/content-negotiation";

test("document negotiation honors quality, specific exclusions, and Markdown ties", () => {
  const cases = [
    [null, "html"], ["", "html"], ["*/*", "html"], ["text/*", "html"],
    ["text/html", "html"], ["text/markdown", "markdown"],
    ["text/html,text/markdown", "markdown"],
    ["text/markdown;q=0.7,text/html;q=0.9", "html"],
    ["text/markdown;q=0.9,text/html;q=0.5", "markdown"],
    ["text/markdown;q=0,*/*;q=1", "html"],
    ["text/html;q=0,text/*;q=0.4", "markdown"],
    ["text/markdown;q=0.3,text/*;q=0.8", "html"],
    ["text/html;q=0.3,text/*;q=0.8", "markdown"],
    ["text/markdown;q=0,text/html;q=0,*/*;q=1", null],
    ["application/json", null], ["*/*;q=0", null],
    ["text/markdown;q=0.5,*/*;q=0.5", "markdown"],
    ["TEXT/MARKDOWN;Q=1.000", "markdown"],
    ['text/markdown; charset="utf-8"', "markdown"],
    ["text/markdown;charset=iso-8859-1", null],
    ["text/markdown;variant=unsupported", null],
    ["text/markdown;charset=utf-8;q=0,text/markdown;q=1,text/html;q=0.3", "html"],
    ["text/markdown;q=0.2,text/markdown;q=0.9,text/html;q=0.5", "markdown"],
    ['text/markdown;q=0.9;note="a,b;c",text/html;q=0.5', "markdown"],
    ["text/markdown;q=2", null], ["text/markdown;q=-1", null],
    ["text/markdown;q=0.1234", null], ["text/markdown;q=oops", null],
    ["text/markdown;q=0;q=1", null], ["*/markdown", null],
  ] as const;
  for (const [accept, expected] of cases) assert.equal(negotiateDocument(accept), expected, String(accept));
});

test("Markdown aliases remain usable by browser wildcard fallback but respect explicit refusal", () => {
  assert.equal(acceptsMarkdown(null), true);
  assert.equal(acceptsMarkdown("text/html,application/xhtml+xml,*/*;q=0.8"), true);
  assert.equal(acceptsMarkdown("text/html"), false);
  assert.equal(acceptsMarkdown("text/markdown;q=0,*/*"), false);
});

test("React streams need an explicit acceptable media range", () => {
  assert.equal(acceptsReactStream("text/x-component"), true);
  assert.equal(acceptsReactStream("text/x-component;q=0.5,text/markdown"), true);
  assert.equal(acceptsReactStream("text/x-component;q=0"), false);
  assert.equal(acceptsReactStream("*/*"), false);
});

test("Vary merging preserves Next fields and de-duplicates names case-insensitively", () => {
  assert.equal(appendVary("RSC, Accept, Next-Router-State-Tree", "accept", "Accept-Encoding"), "RSC, Accept, Next-Router-State-Tree, Accept-Encoding");
  assert.equal(appendVary("*", "Accept"), "*");
});
