import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { buildAgentDocs, cleanDocumentation } from "../scripts/agent-docs";
import type { RegistryItem } from "../scripts/registry";
import { unified } from "unified";
import remarkParse from "remark-parse";

const root = process.cwd();
const build = buildAgentDocs(root);
const registry = JSON.parse(fs.readFileSync(path.join(root, "public/r/registry.json"), "utf8")) as { items: RegistryItem[] };

test("agent indexes follow llms structure and include every downloadable item", () => {
  const index = build.files["public/llms.txt"];
  assert.equal(index, build.files["public/llm.txt"]);
  assert.match(index, /^# ObsidianUI\n\n> /);
  const sections = index.split(/^## /m).slice(1);
  for (const section of sections) {
    const entries = section.split("\n").slice(1).filter(line => line.trim());
    assert.ok(entries.length > 0);
    assert.ok(entries.every(line => /^- \[[^\]]+\]\(https:\/\//.test(line)), section.split("\n")[0]);
  }
  for (const item of registry.items) assert.ok(index.includes(`/r/${item.name}.json`), item.name);
  assert.match(index, /## When to use\n/);
  assert.match(index, /components\.json aliases/);
  assert.match(index, /not a hosted HTTP MCP endpoint/);
});

test("every published page has a generated Markdown representation", () => {
  for (const route of ["/", "/docs", "/components", "/templates", "/project-one", "/playground", "/developers", "/api", "/authentication", "/mcp"]) {
    assert.ok(build.routes[route], route);
  }
  for (const [route, file] of Object.entries(build.routes)) {
    const markdown = build.files[`public${file}`];
    assert.match(markdown, /^# ObsidianUI/, route);
    assert.ok(markdown.trim().length > 100, route);
    assert.ok(!/\b(?:liquid-glass-cursor|staggered-grid|depth-card-stack|animated-modal|animated-faq|testimonial-swiper)\b/.test(route));
  }
  assert.equal(build.documentationCount, Object.keys(build.routes).filter(route => route.startsWith("/docs/")).length);
});

test("MDX controls become readable usage, commands, props, and complete current source", () => {
  const item: RegistryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json", name: "demo", type: "registry:block", dependencies: ["motion"],
    files: [
      { path: "components/block/demo.tsx", target: "@components/block/demo.tsx", type: "registry:block", content: '"use client";\nexport const Demo = () => <span>Current source</span>;' },
      { path: "components/block/demo.css", target: "@components/block/demo.css", type: "registry:file", content: ".demo { color: red; }" },
    ],
  };
  const input = [
    "import { ComponentPreview, CLICommand, Dependencies, PropsTable } from './docs';", "", "# Demo", "", "Useful demo description.", "",
    '<ComponentPreview component={<div />} code={"export const Usage = () => <Demo />;"} />', "", "## Install using CLI", "", '<CLICommand componentName="demo" />', "",
    "## Install Manually", "", '<Dependencies source="demo" title="Copy source">Old manually copied source.</Dependencies>', "",
    "## Props", "", '<PropsTable data={[{ prop: "variant", type: "a | b", defaultValue: "a", description: "Select a variant" }]} />',
  ].join("\n");
  const output = cleanDocumentation(input, "demo", item);
  assert.match(output, /export const Usage = \(\) => <Demo \/>;/);
  assert.match(output, /npx shadcn@latest add "https:\/\/www\.obsidianui\.dev\/r\/demo.json"/);
  assert.match(output, /npm install motion/);
  for (const file of item.files) assert.ok(output.includes(file.content), file.path);
  assert.match(output, /\| variant \| a \\\| b \| a \| Select a variant \|/);
  assert.doesNotMatch(output, /<ComponentPreview|<Dependencies|<PropsTable|Old manually copied source|import \{ ComponentPreview/);
});

test("real component Markdown includes every exact registry source file", () => {
  for (const item of registry.items) {
    const document = build.files[`public/markdown/docs/${item.name}.md`];
    if (!document) continue;
    for (const file of item.files) assert.ok(document.includes(file.content.trim()), `${item.name}: ${file.path}`);
    assert.ok(document.includes(`/r/${item.name}.json`));
  }
  const hover = build.files["public/markdown/docs/hover-img.md"];
  assert.match(hover, /components\/block\/hover-img\.css/);
  assert.match(hover, /## Preview/);
  assert.match(hover, /\| projects \|/);
  const setup = build.files["public/markdown/docs/install-tailwind.md"];
  assert.match(setup, /@import "tailwindcss";/);
  assert.match(setup, /npm install tailwindcss @tailwindcss\/postcss postcss/);
});

test("published Markdown has sequential headings and no unrendered documentation controls", () => {
  const parser = unified().use(remarkParse);
  for (const [filename, document] of Object.entries(build.files)) {
    if (!filename.startsWith("public/markdown/")) continue;
    const tree = parser.parse(document);
    let previousDepth = 0;
    for (const node of tree.children) {
      if (node.type === "heading") {
        assert.ok(node.depth <= previousDepth + 1, `${filename}: heading ${node.depth} after ${previousDepth}`);
        previousDepth = node.depth;
      }
      if (node.type === "html") assert.doesNotMatch(node.value, /<(?:ComponentPreview|ComponentCode|ComponentSource|Dependencies|PropsTable|CodeBlock|CLICommand|ExpandableBlock)\b/, filename);
    }
  }
});

test("generated assets stay synchronized with this checkout", () => {
  for (const [filename, expected] of Object.entries(build.files)) {
    assert.equal(fs.readFileSync(path.join(root, filename), "utf8"), expected, filename);
  }
});
