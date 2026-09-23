import { z } from "zod";
import { generateVisitorId, type VisitorStore } from "./visitors";

const visitSchema = z.object({
  fingerprint: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/).optional(),
}).strict();
const responseHeaders = { "Cache-Control": "no-store" };

function unavailable() {
  return Response.json(
    { success: false, error: "Visitor count is temporarily unavailable" },
    { status: 503, headers: responseHeaders },
  );
}

export function createVisitorHandlers(store: VisitorStore) {
  return {
    async GET() {
      try {
        return Response.json({ success: true, ...await store.getVisitorStats() }, { headers: responseHeaders });
      } catch {
        return unavailable();
      }
    },
    async POST(request: Request) {
      let body: unknown;
      try {
        const reader = request.body?.getReader();
        if (!reader) throw new Error("Missing body");
        const decoder = new TextDecoder();
        let text = "";
        let bytes = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > 1024) {
              await reader.cancel();
              return Response.json({ success: false, error: "Visitor identity is too large" }, { status: 413, headers: responseHeaders });
            }
            text += decoder.decode(value, { stream: true });
          }
          text += decoder.decode();
        } finally {
          reader.releaseLock();
        }
        body = JSON.parse(text);
      } catch {
        return Response.json({ success: false, error: "Send a valid JSON visitor identity" }, { status: 400, headers: responseHeaders });
      }

      const result = visitSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ success: false, error: "Invalid visitor identity" }, { status: 400, headers: responseHeaders });
      }
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip");
      const visitorId = generateVisitorId(ip, request.headers.get("user-agent"), result.data.fingerprint);
      try {
        return Response.json({ success: true, ...await store.trackVisit(visitorId) }, { headers: responseHeaders });
      } catch {
        return unavailable();
      }
    },
  };
}
