import { createHmac, timingSafeEqual } from "crypto";
import type { Job } from "./types";

export type LogLevel = "info" | "warn" | "error";

export function log(
  level: LogLevel,
  message: string,
  metadata: Record<string, unknown> = {},
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    env: process.env.NODE_ENV || "development",
    message,
    ...metadata,
  };

  console.log(JSON.stringify(entry));
}

// Recursively sort object keys — replicates Python's sort_keys=True
export function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortObjectKeys(v)]),
    );
  }
  return obj;
}

export function verifyWebhookPackage(
  payload: Job[],
  secret: string,
  signature: string,
): boolean {
  const sorted = [...payload]
    .sort((a, b) => (String(a.url) < String(b.url) ? -1 : 1))
    .map(sortObjectKeys);
  const canonical = JSON.stringify(sorted);

  const expected = createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  );
}
