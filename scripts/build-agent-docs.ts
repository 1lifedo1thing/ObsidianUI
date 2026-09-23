import { buildAgentDocs, writeAgentDocs } from "./agent-docs";

try {
  const build = buildAgentDocs(process.cwd());
  writeAgentDocs(process.cwd(), build);
  console.log(`Generated ${Object.keys(build.routes).length} Markdown pages, ${build.documentationCount} documentation pages, and agent indexes for ${build.componentCount} published components.`);
} catch (error) {
  console.error("Agent documentation generation failed:", error);
  process.exitCode = 1;
}
