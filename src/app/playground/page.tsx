import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Component Playground | ObsidianUI",
  description: "Explore interactive ObsidianUI registry component previews.",
  alternates: { canonical: "/playground" },
};

export { default } from "@/components/pages/playground-page";
