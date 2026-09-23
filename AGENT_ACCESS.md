# ObsidianUI agent access

## Public resources

- `/robots.txt` permits public crawling, including the named AI crawler identities.
- `/llms.txt` follows the [llms.txt format](https://llmstxt.org/). `/llm.txt` is an identical compatibility alias. The index links every registry download and the published component documentation.
- `/agent-instructions.md` explains when to use ObsidianUI, how to install complete files, alias resolution, dependencies, errors, and the local MCP server.
- `/openapi.json` describes the public read-only component and documentation API using OpenAPI 3.1.1.
- `/developers`, `/api`, `/authentication`, and `/mcp` provide branded developer documentation. MCP is a local stdio resources server; `/mcp` is a documentation page, not a hosted transport.
- Every published page has a Markdown representation selected with `Accept: text/markdown`, plus a predictable `.md` alias. Both negotiated representations vary on Accept. Unsupported representations return 406; missing document paths return a real 404 with recovery links.
- `/r/registry.json`, `/r/index.json`, and `/r/{name}.json` contain complete component files and dependencies, including CSS and supporting files. Resolve target aliases through the destination project's `components.json`.

The build regenerates machine documents from the current registry and published MDX. Do not edit generated files in `public/markdown`, `public/llms*.txt`, `public/llm.txt`, `public/agent-instructions.md`, or `src/lib/generated/agent-route-map.json` by hand.

## Verification

```sh
npm run build
npm run start -- --port 3001
# In another terminal:
npm run verify:agents -- http://localhost:3001
```

The focused verifier checks sitemap pages as HTML and Markdown, Accept/Vary behavior, meaningful server-rendered homepage content, machine files, all component manifests, named crawler identities, and real 404 responses. Run it against the canonical domain after deployment and the firewall change.

Local production verification on September 10, 2026 passed all 687 HTTP requests: 54 sitemap pages in HTML and Markdown, 55 Markdown files and their aliases with GET/HEAD, 45 legacy Markdown endpoints, 102 registry items containing 233 packaged source files, instruction links, OpenAPI, eight crawler identities, real 404s, and negotiation/RSC cases. The homepage contains 4,564 text characters without scripts or styles and 22 sequential headings. The production build, 47 focused tests, and scoped lint/type checks passed. These are local results; repeat verification after deployment to check the hosting edge.

## Next.js compatibility

Next 16.3.4's App Page handler overwrites `Vary` after proxy headers are applied. The reproducible `scripts/patch-next-vary.mjs` patch changes that one operation in both shipped CJS and ESM templates to preserve existing values while merging Next's RSC fields. It runs during installation and before `npm run dev` and `npm run build`, preserving the required response headers in conventional Next builds intended for Vercel. It adds no header fields itself. Next is pinned to 16.3.4; the patch is idempotent and rejects unrecognized versions or template changes. Recheck the upstream handler and remove or update the patch deliberately when upgrading Next. If bypassing the package scripts, run `node scripts/patch-next-vary.mjs` before calling Next directly.

`skipProxyUrlNormalize: true` preserves RSC request headers for the proxy's navigation safeguard. This application uses App Router; `_next` data and static paths remain excluded from document negotiation.

## Production firewall action still required

On September 10, 2026, direct requests to both `obsidianui.dev` and `www.obsidianui.dev` returned Vercel-served HTTP 403 responses for GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, Google-Extended, and Applebot-Extended on `/` and `/robots.txt`. DeepSeekBot and ora-agent received HTTP 200 on both paths. The reachable robots.txt already permitted crawling. These requests use crawler User-Agent strings; they do not prove ownership of a crawler's IP address.

This is evidence of an edge restriction, not a robots.txt exclusion. Application code cannot override a denial made before the request reaches Next.js. No Vercel account connection was available to inspect or edit the matching rule.

In the ObsidianUI Vercel project, open **Firewall → Rules** and identify the matched rule in Firewall traffic logs. If **AI Bots** is set to **Deny**, use **Log** or **Allow** for this public library. If a custom rule or Bot Protection challenge causes the denial, narrow that rule to allow the intended public GET/HEAD documentation and download routes. Preserve protection on unrelated or write endpoints. Review and publish the specific rule change, then rerun the verifier against production. [Vercel managed ruleset documentation](https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets).

## Search visibility

The site consistently publishes `https://www.obsidianui.dev` as its canonical origin, with branded developer titles, structured data, and developer pages in the sitemap. Search rankings still depend on deployment and indexing. Submit the updated sitemap using the site's search-console accounts and confirm the canonical domain in hosting settings; no ranking or readiness score is guaranteed by source changes alone.
