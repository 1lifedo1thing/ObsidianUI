import { createHash } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export interface VisitorData { uniqueVisitors: number }
export interface VisitorStore {
  trackVisit(visitorId: string): Promise<VisitorData>;
  getVisitorStats(): Promise<VisitorData>;
}

let sql: NeonQueryFunction<false, false> | undefined;

function getDatabase() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("Visitor database is not configured");
    sql = neon(connectionString);
  }
  return sql;
}

export function generateVisitorId(ip: string | null, userAgent: string | null, fingerprint?: string): string {
  // Preserve identities already stored by existing visitors.
  if (fingerprint) return `fp:${fingerprint}`;
  return `hash:${createHash("sha256")
    .update(JSON.stringify([ip || "unknown", userAgent || "unknown"]))
    .digest("hex")}`;
}

export async function initVisitorTable(): Promise<void> {
  const database = getDatabase();
  await database`
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function getVisitorStats(): Promise<VisitorData> {
  const database = getDatabase();
  const rows = await database`SELECT COUNT(*) AS count FROM visitors`;
  const uniqueVisitors = Number(rows[0]?.count);
  if (!Number.isSafeInteger(uniqueVisitors) || uniqueVisitors < 0) {
    throw new Error("Invalid visitor count returned by database");
  }
  return { uniqueVisitors };
}

export async function trackVisit(visitorId: string): Promise<VisitorData> {
  const database = getDatabase();
  await database`
    INSERT INTO visitors (visitor_id) VALUES (${visitorId})
    ON CONFLICT (visitor_id) DO NOTHING
  `;
  return getVisitorStats();
}
