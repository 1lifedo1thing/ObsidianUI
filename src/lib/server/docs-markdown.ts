import navigation from "../../content/_meta";

type MarkdownSourceLoader = (slug: string) => Promise<string>;
type MarkdownRouteContext = { params: Promise<{ slug: string }> };

const publishedSlugs = new Set(
  Object.entries(navigation)
    .filter(([, entry]) => typeof entry === "string")
    .map(([slug]) => slug),
);

const markdownHeaders = {
  "Content-Type": "text/markdown; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
  "Link": '</llms.txt>; rel="describedby"',
};

export function createDocumentationMarkdownHandler(loadSource: MarkdownSourceLoader) {
  return async function GET(_request: Request, { params }: MarkdownRouteContext) {
    const { slug } = await params;

    if (!publishedSlugs.has(slug)) {
      return new Response(
        "# Documentation page not found\n\n[Browse the ObsidianUI documentation](/docs/installation).\n\n[AI agent index](/llms.txt) · [Sitemap](/sitemap.xml)\n",
        { status: 404, headers: { ...markdownHeaders, "Cache-Control": "no-store" } },
      );
    }

    try {
      const source = await loadSource(slug);
      if (typeof source !== "string" || !source.trim()) throw new Error("Documentation source is unavailable");

      return new Response(`${source.trim()}\n`, {
        headers: {
          ...markdownHeaders,
          "Content-Disposition": `inline; filename="${slug}.md"`,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    } catch {
      return new Response(
        "# Documentation is temporarily unavailable\n\nPlease try again or [browse the documentation](/docs/installation).\n",
        { status: 500, headers: { ...markdownHeaders, "Cache-Control": "no-store" } },
      );
    }
  };
}
