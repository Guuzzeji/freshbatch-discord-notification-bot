import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";

import { createJobsNotification } from "./discord-webhook";
import { verifyWebhookPackage } from "./utils";

import type { Job } from "./types";

dotenv.config();
const PORT = process.env.PORT || 3232;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req: express.Request, res: express.Response) => {
  const receivedSig = req.headers["webhook-signature"] as string | undefined;
  if (!receivedSig) {
    return res.status(401).json({ error: "Missing signature" });
  }

  // Assuming the payload is in the expected format, otherwise this will throw an error which will be caught below
  try {
    const jobs: Job[] = req.body?.data ?? [];
    console.log("Invalid signature. Payload:", req.body);

    if (!verifyWebhookPackage(jobs, WEBHOOK_SECRET, receivedSig)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    await createJobsNotification(jobs);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
