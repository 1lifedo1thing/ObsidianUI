import assert from "node:assert/strict";
import test from "node:test";
import { createVisitorHandlers } from "../src/lib/server/visitor-api";
import { generateVisitorId, type VisitorStore } from "../src/lib/server/visitors";

function store(): VisitorStore {
  const visits = new Set<string>();
  return {
    async trackVisit(id) { visits.add(id); return { uniqueVisitors: visits.size }; },
    async getVisitorStats() { return { uniqueVisitors: visits.size }; },
  };
}

const request = (body: string) => new Request("http://localhost/api/visitors", {
  method: "POST", headers: { "Content-Type": "application/json" }, body,
});

test("repeated browser identities count once and preserve existing IDs", async () => {
  const handlers = createVisitorHandlers(store());
  for (let i = 0; i < 2; i++) {
    const response = await handlers.POST(request('{"fingerprint":"abc123"}'));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, uniqueVisitors: 1 });
  }
  assert.equal(generateVisitorId(null, null, "abc123"), "fp:abc123");
});

test("invalid and oversized identities never reach the store", async () => {
  let calls = 0;
  const handlers = createVisitorHandlers({
    async trackVisit() { calls++; return { uniqueVisitors: 0 }; },
    async getVisitorStats() { return { uniqueVisitors: 0 }; },
  });
  for (const body of ['null', '[]', '{', '{"fingerprint":{}}', '{"fingerprint":""}']) {
    assert.equal((await handlers.POST(request(body))).status, 400);
  }
  assert.equal((await handlers.POST(request(JSON.stringify({ fingerprint: "x".repeat(2000) })))).status, 413);
  assert.equal(calls, 0);
});

test("database failures are unavailable, never a successful zero count", async () => {
  const fail = async () => { throw new Error("private database details"); };
  const handlers = createVisitorHandlers({ trackVisit: fail, getVisitorStats: fail });
  for (const response of [await handlers.GET(), await handlers.POST(request('{"fingerprint":"abc"}'))]) {
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { success: false, error: "Visitor count is temporarily unavailable" });
  }
});

test("fallback hashes include the complete browser string", () => {
  const common = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ";
  assert.notEqual(generateVisitorId("127.0.0.1", common + "Chrome"), generateVisitorId("127.0.0.1", common + "Firefox"));
  assert.equal(generateVisitorId("127.0.0.1", common), generateVisitorId("127.0.0.1", common));
});
