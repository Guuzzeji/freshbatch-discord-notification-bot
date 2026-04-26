import { createHmac } from "crypto";
import type { Job } from "./types";
import { sortObjectKeys } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3232";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

function generateWebhookSignature(payload: Job[], secret: string): string {
  const sorted = [...payload]
    .sort((a, b) => (String(a.url) < String(b.url) ? -1 : 1))
    .map(sortObjectKeys);
  const canonical = JSON.stringify(sorted);
  return createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
}

async function main() {
  if (!WEBHOOK_SECRET) {
    console.error("Error: WEBHOOK_SECRET not set");
    process.exit(1);
  }

  const jobs = JSON.parse(await Bun.file("./sample-jobs.json").text());
  const signature = generateWebhookSignature(jobs, WEBHOOK_SECRET);
  console.log(JSON.stringify({ data: jobs }));
  const response = await fetch(`${SERVER_URL}/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "webhook-signature": signature,
    },
    body: JSON.stringify({ data: jobs }),
  });

  if (response.ok) {
    console.log("✅ Success! Webhook sent to Discord");
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Jobs sent: ${jobs.length}`);
  } else {
    console.error("❌ Failed:", await response.text());
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
