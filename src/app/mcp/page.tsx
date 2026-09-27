import { DeveloperResourcePage } from "@/components/pages/developer-resource-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "MCP Server | ObsidianUI",
  "Connect coding agents to ObsidianUI component source with the local stdio MCP server.",
  "/mcp",
);
export default function Page() { return <DeveloperResourcePage pathname="/mcp" />; }
