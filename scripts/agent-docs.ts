import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import type { Root, RootContent, PhrasingContent } from "mdast";
import navigation from "../src/content/_meta";
import { effectExamples } from "../src/components/catalog/effect-examples";
import { developerResources, ORIGIN } from "../src/lib/agent/developer-resources";
import type { Registry, RegistryItem } from "./registry";

interface MdxNode {
  type: string;
  name?: string | null;
  value?: string;
  depth?: number;
  children?: MdxNode[];
  attributes?: Array<{ type: string; name?: string; value?: string | { value: string } | null }>;
}

const parser = unified().use(remarkParse).use(remarkMdx);
const writer = unified().use(remarkStringify, { bullet: "-", fences: true });
const text = (value: string): PhrasingContent => ({ type: "text", value });
const paragraph = (value: string): RootContent => ({ type: "paragraph", children: [text(value)] });
const heading = (depth: 1 | 2 | 3, value: string): RootContent => ({ type: "heading", depth, children: [text(value)] });
const code = (value: string, lang = "tsx"): RootContent => ({ type: "code", lang, value: value.trim() });
const link = (title: string, url: string): PhrasingContent => ({ type: "link", url, children: [text(title)] });
const markdown = (children: RootContent[]) => writer.stringify({ type: "root", children });
const registryUrl = (name: string) => `${ORIGIN}/r/${name}.json`;

/** Interpret literal MDX values without executing expressions or imported modules. */
function literal(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isParenthesizedExpression(node)) return literal(node.expression);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(element => literal(element));
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(property => [
      property.name.getText().replace(/^["']|["']$/g, ""), literal(property.initializer),
    ]));
  }
  return undefined;
}

function attribute(node: MdxNode, name: string): unknown {
  const value = node.attributes?.find(attribute => attribute.name === name)?.value;
  if (typeof value === "string" || value == null) return value;
  const source = ts.createSourceFile("attribute.ts", `const value = (${value.value});`, ts.ScriptTarget.Latest, true);
  const statement = source.statements[0];
  if (!statement || !ts.isVariableStatement(statement)) return undefined;
  const initializer = statement.declarationList.declarations[0].initializer;
  return initializer ? literal(initializer) : undefined;
}

function plainText(node: MdxNode): string {
  return node.value ?? node.children?.map(plainText).join("") ?? "";
}

function containsSourceControl(node: MdxNode): boolean {
  return ["Dependencies", "ExpandableBlock", "CodeBlock", "ComponentSource", "ComponentCode"].includes(node.name ?? "") || Boolean(node.children?.some(containsSourceControl));
}

function renderSource(item: RegistryItem): RootContent[] {
  return [
    heading(2, "Install manually — complete source"),
    {
      type: "paragraph", children: [
        text("Download the complete manifest: "), link(`${item.name}.json`, registryUrl(item.name)),
        text(". It includes every required local file and package dependency."),
      ],
    },
    ...(item.dependencies.length ? [paragraph("Install the listed package dependencies in your React project:"), code(`npm install ${item.dependencies.join(" ")}`, "bash")] : [paragraph("This item adds no package dependencies beyond the host React project.")]),
    paragraph("Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/* resolves to src/*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present."),
    ...(item.docs ? [paragraph(item.docs)] : []),
    ...item.files.flatMap(file => [
      heading(3, file.path),
      { type: "paragraph", children: [text("Installation target: "), { type: "inlineCode", value: file.target }] } as RootContent,
      code(file.content, path.extname(file.path).slice(1) || "text"),
    ]),
  ];
}

/** Convert the documentation's MDX controls to real Markdown, preserving fenced code. */
export function cleanDocumentation(source: string, slug: string, item?: RegistryItem): string {
  const tree = parser.parse(source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")) as Root;
  const dependencyDepth = tree.children.some(node => node.type === "heading" && node.depth === 2) ? 3 : 2;
  const convert = (node: MdxNode): RootContent[] => {
    if (node.type === "mdxjsEsm" || node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") return [];
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      const children = () => (node.children ?? []).flatMap(convert);
      const name = node.name;
      if (name === "ComponentPreview") {
        const example = attribute(node, "code") ?? effectExamples[slug as keyof typeof effectExamples];
        const description = attribute(node, "description");
        return [heading(2, "Preview"), {
          type: "paragraph", children: [link("Open the interactive component preview", `${ORIGIN}/docs/${slug}`)],
        }, ...(typeof description === "string" ? [paragraph(description)] : []), ...(typeof example === "string" ? [code(example)] : [])];
      }
      if (name === "CLICommand") {
        const componentName = attribute(node, "componentName");
        if (typeof componentName !== "string") throw new Error(`Missing CLI component name in ${slug}`);
        return [code(`npx shadcn@latest add "${registryUrl(componentName)}"`, "bash")];
      }
      if (name === "CodeBlock") {
        const content = attribute(node, "code");
        if (typeof content !== "string") throw new Error(`Nonliteral CodeBlock in ${slug}`);
        const language = attribute(node, "language");
        return [code(content, typeof language === "string" ? language : "bash")];
      }
      if (name === "Dependencies") {
        const title = attribute(node, "title");
        const sourceName = attribute(node, "source");
        return [...(typeof title === "string" ? [heading(dependencyDepth, title)] : []), ...children(),
          ...(typeof sourceName === "string" ? [{ type: "paragraph", children: [link("Download all source files", registryUrl(sourceName))] } as RootContent] : [])];
      }
      if (name === "PropsTable") {
        const rows = attribute(node, "data");
        if (!Array.isArray(rows)) throw new Error(`Nonliteral PropsTable in ${slug}`);
        const escape = (value: unknown) => String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
        return [{ type: "html", value: ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows.map(row => {
          const values = row as Record<string, unknown>;
          return `| ${["prop", "type", "defaultValue", "description"].map(key => escape(values[key])).join(" | ")} |`;
        })].join("\n") }];
      }
      if (name === "code") return [{ type: "inlineCode", value: plainText(node) } as unknown as RootContent];
      if (name === "p") return [{ type: "paragraph", children: children() as PhrasingContent[] }];
      if (name === "strong" || name === "b") return [{ type: "strong", children: children() as PhrasingContent[] } as unknown as RootContent];
      if (name === "a") return [{ type: "link", url: String(attribute(node, "href") ?? ""), children: children() as PhrasingContent[] } as unknown as RootContent];
      if (name === "PreviewVideo") {
        const url = attribute(node, "src");
        return typeof url === "string" ? [{ type: "paragraph", children: [link("Preview video", url)] }] : [];
      }
      return children();
    }
    const transformed = { ...node };
    if (node.children) transformed.children = node.children.flatMap(convert) as MdxNode[];
    if (node.type === "code") delete (transformed as MdxNode & { meta?: unknown }).meta;
    return [transformed as RootContent];
  };

  const output: RootContent[] = [];
  let inManual = false;
  let insertedSource = false;
  for (const node of tree.children as MdxNode[]) {
    if (node.type === "heading" && node.depth === 2) {
      inManual = Boolean(item && /install manually/i.test(plainText(node)));
      if (inManual && item) { output.push(...renderSource(item)); insertedSource = true; continue; }
    }
    if (!inManual) output.push(...convert(node));
    else if (node.type === "paragraph" && !containsSourceControl(node)) output.push(...convert(node));
  }
  if (item && !insertedSource) output.push(...renderSource(item));
  const title = output.find(node => node.type === "heading" && node.depth === 1);
  if (title?.type === "heading") title.children = [text(`ObsidianUI — ${plainText(title as MdxNode)}`)];
  let previousDepth = 1;
  for (const node of output) {
    if (node.type !== "heading") continue;
    node.depth = Math.min(node.depth, previousDepth + 1) as typeof node.depth;
    previousDepth = node.depth;
  }
  output.splice(1, 0, { type: "paragraph", children: [link("Canonical page", `${ORIGIN}/docs/${slug}`), text(" · "), link("Agent guide", `${ORIGIN}/agent-instructions.md`)] });
  return markdown(output);
}

function developerMarkdown(): Record<string, string> {
  return Object.fromEntries(Object.entries(developerResources).map(([route, resource]) => [route, markdown([
    heading(1, resource.title), paragraph(resource.description),
    ...resource.sections.flatMap(section => [
      heading(2, section.title), ...(section.paragraphs ?? []).map(paragraph),
      ...(section.code ? [code(section.code, "bash")] : []),
      ...(section.links ?? []).map(item => ({ type: "paragraph", children: [link(item.title, new URL(item.href, ORIGIN).href), ...(item.description ? [text(` — ${item.description}`)] : [])] }) as RootContent),
    ]),
  ])]));
}

const agentInstructions = `# ObsidianUI agent instructions

## When to use ObsidianUI

Use ObsidianUI when a user wants React interface components they can own and customize: buttons, menus, galleries, scroll animations, cursor effects, text reveals, canvas backgrounds, or WebGL effects. Start with a published example, retrieve its complete source, and adapt it to the user's existing design system. Use the documentation for installation, props, usage, and preview behavior.

## When another tool is needed

ObsidianUI is a component library, not a cloud workspace, hosted coding agent, backend, or deployment service. Do not assume it supplies authentication, payments, storage, or a hosted MCP endpoint. Interactive previews require JavaScript; documentation and source downloads do not.

## Discover and install a component

1. Read [llms.txt](${ORIGIN}/llms.txt) and [the component catalogue](${ORIGIN}/markdown/components.md). Find a component by its documented name and use case.
2. GET [the registry](${ORIGIN}/r/registry.json). Its \`items\` include published components and supporting UI primitives. Each item has a unique \`name\`, \`type\`, \`dependencies\`, and \`files\`.
3. GET \`${ORIGIN}/r/{name}.json\`. Use an actual name from the catalogue. This is a complete shadcn-compatible JSON manifest, not a binary archive. Read every \`files[].content\`, \`files[].target\`, \`dependencies\`, \`docs\`, and \`meta\` field that is present.
4. For a project using shadcn, the documented installation command is \`npx shadcn@latest add "${ORIGIN}/r/{name}.json"\`. Run installation only within the user's authorized project workflow. A direct download does not execute code.
5. For manual installation, resolve target aliases through the destination project's \`components.json\`: \`@ui/\` uses \`aliases.ui\`, \`@components/\` uses \`aliases.components\`, \`@lib/\` uses \`aliases.lib\`, and \`@hooks/\` uses \`aliases.hooks\`. Resolve their TypeScript aliases to filesystem paths. For this site's defaults, \`@ui/button.tsx\` becomes \`src/components/ui/button.tsx\` and \`@components/block/hover-img.tsx\` becomes \`src/components/block/hover-img.tsx\`. A \`public/\` target is relative to the project root. Do not create literal directories named \`@ui\` or \`@components\`.
6. Copy all required files, including CSS, hooks, utilities, shaders, and local assets. Keep paths inside the destination project and review existing files before replacing them. Install each listed package dependency with the project's package manager. React, React DOM, and a compatible host framework are project prerequisites.
7. Preserve \`"use client"\` boundaries, CSS imports, and alias configuration. Start from the usage example. If \`meta.remoteAssets\` lists demo images or videos, replace them with the user's own assets for offline use. If \`meta.requiredEndpoints\` is present, implement those application endpoints yourself; they are not supplied by the component registry.
8. Check the resulting component with the user's real content, keyboard input, reduced motion setting, and target viewport. Copying code is not evidence that the interaction was tested.

## Read without JavaScript

Request a published page with \`Accept: text/markdown\`, or use its direct Markdown URL. The homepage is [index.md](${ORIGIN}/markdown/index.md); a documentation page is \`/markdown/docs/{slug}.md\`. The compatibility endpoint \`/api/docs/{slug}/markdown\` returns the same clean document. Source blocks include all installation files; the JSON manifest remains the canonical machine-installable download.

## API, authentication, and MCP

Public documentation and registry reads require no account, API key, cookie, or bearer token. [OpenAPI](${ORIGIN}/openapi.json) describes the published read surface. See [authentication](${ORIGIN}/authentication) for its scope.

The repository includes a local MCP resource server. In a checkout, install project dependencies, run \`npm run registry:build\`, then configure an MCP client to launch \`npm run mcp\` with the checkout as its working directory. It uses stdio and exposes \`resources/list\` and \`resources/read\` at \`obsidian://{name}\`. It does not expose installation tools or a hosted HTTP transport. See [MCP documentation](${ORIGIN}/mcp).

## Errors and freshness

Use the returned HTTP status. A missing page or component is not a valid empty document: recover through [the sitemap](${ORIGIN}/sitemap.xml), [llms.txt](${ORIGIN}/llms.txt), or [the registry](${ORIGIN}/r/registry.json). On a temporary server error, retry with backoff. Do not invent removed component names. Generated content is rebuilt from the current published documentation and registry with \`npm run agent:build\`; the production build runs registry generation first.

## License

ObsidianUI's repository is MIT licensed. Preserve the copyright and license notice when required. Third-party packages and media retain their own licenses; a component demo does not transfer rights to external assets. [Repository license](https://github.com/Atharvsinh-codez/ObsidianUI/blob/main/LICENSE).
`;

export interface AgentDocsBuild { routes: Record<string, string>; files: Record<string, string>; documentationCount: number; componentCount: number }

export function buildAgentDocs(projectRoot: string): AgentDocsBuild {
  const registry = JSON.parse(fs.readFileSync(path.join(projectRoot, "public/r/registry.json"), "utf8")) as Registry;
  const items = new Map(registry.items.map(item => [item.name, item]));
  const docs = Object.entries(navigation).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  const components = docs.filter(([slug]) => items.has(slug));
  const componentLinks = components.map(([slug, title]) => `- [${title}](${ORIGIN}/markdown/docs/${slug}.md): [download all source files](${registryUrl(slug)}) and [interactive preview](${ORIGIN}/docs/${slug}).`).join("\n");
  const pages: Record<string, string> = {
    "/": `# ObsidianUI\n\n> Design less. Ship better.\n\nObsidianUI is an open-source React component library for animated, interactive interfaces. Browse component previews, read usage examples, and copy the complete source into your own project. Components use Tailwind CSS with Motion, GSAP, canvas, or WebGL where appropriate. You control the markup, styling, and behavior after installation.\n\n## Start building\n\nUse the component catalogue to choose a button, menu, gallery, scroll animation, cursor effect, text reveal, or background. Documentation includes installation commands, props where available, and complete source files. A compatible React project and the dependencies listed in the component registry are required. Some examples use browser APIs or hosted demo media; preserve client boundaries and replace sample content with your own.\n\n- [Browse components](${ORIGIN}/components)\n- [Install Next.js](${ORIGIN}/docs/installation)\n- [Templates](${ORIGIN}/templates)\n- [Developer resources](${ORIGIN}/developers)\n- [Download component registry](${ORIGIN}/r/registry.json)\n\n## For AI agents\n\nRead [the agent instructions](${ORIGIN}/agent-instructions.md) to discover a component and install every source file. [llms.txt](${ORIGIN}/llms.txt) lists the available resources. Public reads require no account or API key. Request Markdown using Accept: text/markdown.\n\n## Open source\n\nObsidianUI is MIT licensed. Keep the license notice where required; third-party dependencies and external media have their own licenses. [Source repository](https://github.com/Atharvsinh-codez/ObsidianUI).\n`,
    "/components": `# ObsidianUI component showcase\n\nAnimated, interactive components for React. Built with Tailwind CSS and animation libraries, ready to copy, customize, and ship your next interface.\n\n## Explore the components\n\nFind your next detail. Preview it, read the usage example, and copy all required files from its JSON manifest. ${components.length} components have published documentation. The [complete registry](${ORIGIN}/r/registry.json) also includes supporting UI primitives.\n\n${componentLinks}\n\n## Installation\n\n[Agent installation guide](${ORIGIN}/agent-instructions.md) · [Next.js setup](${ORIGIN}/docs/installation) · [CLI and MCP](${ORIGIN}/docs/cli)\n`,
    "/templates": `# ObsidianUI templates\n\nProduction-ready UI for your next project.\n\n## Project One\n\nA landing page template with a futuristic visual direction for the creator economy. Built with React, TypeScript, Tailwind CSS, Motion, and Next.js.\n\n- [Template details](${ORIGIN}/project-one)\n- [Live preview](https://project-one.obsidianui.dev/)\n- [Source repository](https://github.com/Atharvsinh-codez/Project-1)\n\nThe template is a separate repository; use its own setup instructions and license. Component JSON manifests live in the [ObsidianUI component registry](${ORIGIN}/r/registry.json).\n`,
    "/project-one": `# ObsidianUI — Project One\n\nA landing page concept exploring a futuristic visual direction around the creator economy. It presents creators as digital assets through a modern interface. Built with React, TypeScript, Tailwind CSS, Motion, and Next.js.\n\n## Preview and source\n\n- [Live preview](https://project-one.obsidianui.dev/)\n- [Source repository](https://github.com/Atharvsinh-codez/Project-1)\n- [Template preview video](https://cdn.obsidianui.dev/templates/project-one.mp4)\n- [All templates](${ORIGIN}/templates)\n\nFollow the template repository's installation instructions and license. This template has a separate source repository; it is not a component registry item.\n`,
    "/playground": `# ObsidianUI playground\n\nExplore experimental component previews: an animated responsive navbar and a styled button. Interactive previews require JavaScript.\n\n## Download source\n\n- [Playground navbar](${registryUrl("playground-navbar")})\n- [Playground button](${registryUrl("playground-button")})\n- [Installation guide](${ORIGIN}/docs/installation)\n- [Published component catalogue](${ORIGIN}/components)\n`,
    ...developerMarkdown(),
  };
  for (const [slug] of docs) pages[`/docs/${slug}`] = cleanDocumentation(fs.readFileSync(path.join(projectRoot, `src/content/${slug}.mdx`), "utf8"), slug, items.get(slug));
  // /docs is the public documentation entry point even when it redirects to installation.
  pages["/docs"] = `# ObsidianUI documentation\n\nInstallation guides and complete component source.\n\n${docs.map(([slug, title]) => `- [${title}](${ORIGIN}/markdown/docs/${slug}.md)`).join("\n")}\n`;
  const routes = Object.fromEntries(Object.keys(pages).map(route => [route, `/markdown/${route === "/" ? "index" : route.slice(1)}.md`]));
  const files = Object.fromEntries(Object.entries(pages).map(([route, content]) => [`public${routes[route]}`, content.trim() + "\n"]));
  const otherItems = registry.items.filter(item => !components.some(([slug]) => slug === item.name));
  const llms = `# ObsidianUI\n\n> Open-source React components with complete source downloads, usage examples, and interactive previews.\n\nUse ObsidianUI to add buttons, navigation, galleries, scroll animations, cursor effects, text reveals, canvas backgrounds, and WebGL effects to React interfaces. The source is yours to customize. Public reads require no account, API key, or JavaScript.\n\nFor installation, GET /r/registry.json, choose an existing item name, then GET /r/{name}.json. Copy every files[].content to its resolved files[].target and install the listed dependencies. Target prefixes @ui/, @components/, @lib/, and @hooks/ resolve through your project's components.json aliases; do not create literal @-named directories. Preserve CSS files, client directives, and required local helpers. Replace remote demo assets as appropriate. The documented CLI is npx shadcn@latest add \"${ORIGIN}/r/{name}.json\". Read the agent guide before changing project files.\n\nRequest any published page with Accept: text/markdown or read its direct Markdown URL. /llm.txt is an identical compatibility alias of this /llms.txt index. The repository has a local stdio MCP resource server (npm run mcp), not a hosted HTTP MCP endpoint. ObsidianUI is MIT licensed; preserve applicable notices and respect third-party package and asset licenses.\n\n## When to use\n\n- [Agent instructions](${ORIGIN}/agent-instructions.md): Choose components for React UI tasks, retrieve complete manifests, resolve file targets, install dependencies, and handle missing resources.\n\n## Developer resources\n\n- [Developer portal](${ORIGIN}/markdown/developers.md): ObsidianUI documentation, registry downloads, API, authentication, and MCP entry points.\n- [API documentation](${ORIGIN}/markdown/api.md): Read-only registry and Markdown HTTP endpoints.\n- [OpenAPI specification](${ORIGIN}/openapi.json): Machine-readable HTTP API contract.\n- [Authentication](${ORIGIN}/markdown/authentication.md): Public read access requires no credentials.\n- [MCP server](${ORIGIN}/markdown/mcp.md): Local stdio resources/list and resources/read at obsidian://{name}.\n- [Registry catalogue](${ORIGIN}/r/registry.json): ${registry.items.length} complete registry items, including supporting UI primitives.\n- [Sitemap](${ORIGIN}/sitemap.xml): Published page discovery.\n\n## Getting started\n\n${docs.filter(([slug]) => !items.has(slug)).map(([slug, title]) => `- [${title}](${ORIGIN}/markdown/docs/${slug}.md): ObsidianUI setup documentation.`).join("\n")}\n\n## Components\n\n${componentLinks}\n\n## Supporting registry items\n\n${otherItems.map(item => `- [${item.name}](${registryUrl(item.name)}): Complete ${item.type} source and dependencies.`).join("\n")}\n\n## Site pages\n\n- [ObsidianUI home](${ORIGIN}/markdown/index.md): Product overview and installation workflow.\n- [Component showcase](${ORIGIN}/markdown/components.md): Published component catalogue with Markdown documentation and downloads.\n- [Templates](${ORIGIN}/markdown/templates.md): Template catalogue.\n- [Project One](${ORIGIN}/markdown/project-one.md): Template preview and separate source repository.\n- [Playground](${ORIGIN}/markdown/playground.md): Experimental navbar and button previews.\n\n## Optional\n\n- [All documentation in one file](${ORIGIN}/llms-full.txt): Complete Markdown documentation and source blocks; use individual documents to keep context small.\n- [Source repository](https://github.com/Atharvsinh-codez/ObsidianUI): Source, contribution history, and MIT license.\n`;
  files["public/llms.txt"] = llms;
  files["public/llm.txt"] = llms;
  files["public/agent-instructions.md"] = agentInstructions;
  files["public/llms-full.txt"] = [llms, agentInstructions, ...Object.values(pages)].join("\n\n---\n\n");
  files["src/lib/generated/agent-route-map.json"] = JSON.stringify(routes, null, 2) + "\n";
  return { routes, files, documentationCount: docs.length, componentCount: components.length };
}

export function writeAgentDocs(projectRoot: string, build: AgentDocsBuild): void {
  const previousMapPath = path.join(projectRoot, "src/lib/generated/agent-route-map.json");
  if (fs.existsSync(previousMapPath)) {
    const previous = JSON.parse(fs.readFileSync(previousMapPath, "utf8")) as Record<string, string>;
    const generatedRoot = path.resolve(projectRoot, "public/markdown");
    for (const url of Object.values(previous)) {
      if (!/^\/markdown\/[a-z0-9/-]+\.md$/.test(url) || Object.values(build.routes).includes(url)) continue;
      const obsolete = path.resolve(projectRoot, `public${url}`);
      const relative = path.relative(generatedRoot, obsolete);
      if (!relative.startsWith("..") && !path.isAbsolute(relative)) fs.rmSync(obsolete, { force: true });
    }
  }
  for (const [filename, content] of Object.entries(build.files)) {
    const target = path.join(projectRoot, filename);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }
}
