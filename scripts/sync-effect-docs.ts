import fs from "node:fs";
import path from "node:path";
import { buildRegistry } from "./registry";
import { newEffects } from "../src/components/catalog/new-effects";
import { effectExamples } from "../src/components/catalog/effect-examples";

// Keep the complete manual installation source and Copy Page markdown in sync.
const root = process.cwd();
const registry = buildRegistry(root);
for (const effect of newEffects) {
    const item = registry.items.find(item => item.name === effect.slug);
    if (!item) throw new Error(`Missing effect source: ${effect.slug}`);
    const files = [...item.files].sort((a, b) => {
        const main = `components/block/${effect.slug}.jsx`;
        return a.path === main ? -1 : b.path === main ? 1 : a.path.localeCompare(b.path);
    });
    const sourceCards = files.map((file, index) => {
        const language = file.path.endsWith(".css") ? "css" : file.path.endsWith(".svg") ? "xml" : file.path.endsWith(".ts") ? "ts" : "jsx";
        const title = index === 0 ? "Copy the source code" : file.path.endsWith(".css") ? "Add the CSS file" : "Add the supporting file";
        return `<Dependencies step={${index + 2}} title="${title}" className="docs-source-card">
  <p className="mb-4 text-sm text-muted-foreground">Copy into <code className="rounded-full bg-muted px-2 py-1 font-mono text-xs text-foreground">${file.path}</code></p>

<ExpandableBlock>
\`\`\`${language} copy
${file.content.trim()}
\`\`\`
</ExpandableBlock>
</Dependencies>`;
    }).join("\n\n");
    const dependencies = item.dependencies.length
        ? `<CodeBlock code="npm install ${item.dependencies.join(" ")}" />`
        : "<p>No additional packages are required beyond React.</p>";
    const document = `import { CodeBlock, Dependencies } from '@/components/docs/component-installation'
import { CLICommand } from '@/components/docs/cli-command'
import { ComponentPreview } from '@/components/docs/component-preview'
import { ExpandableBlock } from '@/components/docs/expandable-block'
import { EffectPreview } from '@/components/catalog/effect-preview'
import { effectExamples } from '@/components/catalog/effect-examples'

# ${effect.title}

${effect.description}

<ComponentPreview component={<EffectPreview slug="${effect.slug}" />} code={effectExamples["${effect.slug}"]} description="${effect.hint}" previewClassName="p-0 sm:p-0" />

## Install using CLI

<CLICommand componentName="${effect.slug}" />

## Usage

\`\`\`jsx copy
${effectExamples[effect.slug]}
\`\`\`

## Install Manually

<Dependencies step={1} title="Install dependencies">
  ${dependencies}
</Dependencies>

${sourceCards}

${item.docs ?? ""}

## Preview behavior

${effect.hint} The effect stays inside its container and respects reduced motion preferences.
`;
    fs.writeFileSync(path.join(root, "src", "content", `${effect.slug}.mdx`), document, "utf8");
}
console.log(`Updated ${newEffects.length} complete effect documentation pages.`);
