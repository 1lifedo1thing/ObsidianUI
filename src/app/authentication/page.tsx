import { DeveloperResourcePage } from "@/components/pages/developer-resource-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Authentication | ObsidianUI",
  "Access ObsidianUI public documentation and component downloads without an account or API key.",
  "/authentication",
);
export default function Page() { return <DeveloperResourcePage pathname="/authentication" />; }
