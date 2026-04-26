import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";

import { createJobsNotification } from "./discord-webhook";
import { log, verifyWebhookPackage } from "./utils";

import type { Job } from "./types";

dotenv.config();
const PORT = process.env.PORT || 3232;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

const app = express();
app.use(bodyParser.json());

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      log("info", "request.completed", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
        userAgent: req.get("user-agent") ?? null,
      });
    });

    next();
  },
);

app.post("/webhook", async (req: express.Request, res: express.Response) => {
  const requestId = String(res.getHeader("x-request-id") || "");
  const receivedSig = req.headers["webhook-signature"] as string | undefined;
  const payload = req.body;
  if (!receivedSig) {
    log("warn", "webhook.rejected.missing_signature", {
      requestId,
      path: req.originalUrl,
      payload,
      jobCount: Array.isArray(req.body?.data) ? req.body.data.length : 0,
    });
    return res.status(401).json({ error: "Missing signature" });
  }

  // Assuming the payload is in the expected format, otherwise this will throw an error which will be caught below
  try {
    const jobs: Job[] = req.body?.data ?? [];
    log("info", "webhook.received", {
      requestId,
      path: req.originalUrl,
      payload,
      signature: receivedSig,
      hasSignature: true,
      jobCount: jobs.length,
    });

    if (!verifyWebhookPackage(jobs, WEBHOOK_SECRET, receivedSig)) {
      log("warn", "webhook.rejected.invalid_signature", {
        requestId,
        path: req.originalUrl,
        payload,
        signature: receivedSig,
        jobCount: jobs.length,
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    await createJobsNotification(jobs);
    log("info", "webhook.delivered", {
      requestId,
      path: req.originalUrl,
      payload,
      signature: receivedSig,
      jobCount: jobs.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "webhook.failed", {
      requestId,
      path: req.originalUrl,
      payload,
      signature: receivedSig,
      error: message,
    });
    return res.status(500).json({ error: "Internal server error" });
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  log("info", "server.started", { port: PORT });
});
