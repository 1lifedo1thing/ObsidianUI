import { createVisitorHandlers } from "@/lib/server/visitor-api";
import { getVisitorStats, trackVisit } from "@/lib/server/visitors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handlers = createVisitorHandlers({ getVisitorStats, trackVisit });
export const GET = handlers.GET;
export const POST = handlers.POST;
