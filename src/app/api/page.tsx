import { DeveloperResourcePage } from "@/components/pages/developer-resource-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "API Documentation | ObsidianUI",
  "Read ObsidianUI component source and documentation through the public registry and Markdown API.",
  "/api",
);
export default function Page() { return <DeveloperResourcePage pathname="/api" />; }
