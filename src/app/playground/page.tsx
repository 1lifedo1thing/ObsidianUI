import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Component Playground | ObsidianUI",
  "Try interactive ObsidianUI component previews and explore the source behind each experiment.",
  "/playground",
);

export { default } from "@/components/pages/playground-page";
