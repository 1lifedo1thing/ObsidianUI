import { openapi } from "@/lib/agent/openapi";

export const dynamic = "force-static";
export function GET() {
  return Response.json(openapi, { headers: {
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
    "Link": '</llms.txt>; rel="describedby", </api>; rel="service-doc"',
  } });
}
