import { DeveloperResourcePage } from "@/components/pages/developer-resource-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Developer Resources | ObsidianUI",
  "Find ObsidianUI API documentation, OpenAPI details, MCP setup, and complete React component downloads.",
  "/developers",
);
export default function Page() { return <DeveloperResourcePage pathname="/developers" />; }
