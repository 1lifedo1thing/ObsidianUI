import { DeveloperResourcePage } from "@/components/pages/developer-resource-page";
export const metadata = { title: "ObsidianUI Developer Portal", description: "ObsidianUI API docs, OpenAPI, authentication, MCP setup, and complete React component downloads.", alternates: { canonical: "/developers" } };
export default function Page() { return <DeveloperResourcePage pathname="/developers" />; }
