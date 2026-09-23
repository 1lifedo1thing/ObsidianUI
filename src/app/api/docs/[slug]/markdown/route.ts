import { readFile } from "node:fs/promises";
import path from "node:path";
import { createDocumentationMarkdownHandler } from "@/lib/server/docs-markdown";

export const runtime = "nodejs";

// The handler validates the slug against published docs before calling this loader.
export const GET = createDocumentationMarkdownHandler(slug =>
  readFile(path.join(process.cwd(), "public", "markdown", "docs", `${slug}.md`), "utf8"),
);
