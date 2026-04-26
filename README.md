# Freshbatch Discord Notification Bot

This project receives Freshbatch-style webhook job payloads, verifies the request signature, and forwards the jobs to Discord through a webhook embed message.

> **POWER BY:** Freshbatch (https://freshbatch.tech) - a job aggregator for software engineering roles.

## Purpose

Use this bot to:

- Validate that webhook events are authentic (HMAC verification)
- Convert incoming job data into a readable Discord message
- Quickly test end-to-end webhook delivery with local mock data

## How It Works

1. A POST request is sent to the /webhook endpoint.
2. The server reads webhook-signature from request headers.
3. Payload data is normalized and signed comparison is performed using WEBHOOK_SECRET.
4. If valid, the job list is formatted into a Discord embed.
5. The embed is sent to your Discord webhook URL.

If the signature is missing or invalid, the request is rejected with 401.

## Project Structure

- server.ts
  Runs the Express server and handles the /webhook endpoint.
- utils.ts
  Contains signature verification logic and payload key sorting utilities.
- discord-webhook.ts
  Builds the Discord embed and sends the message through discord.js WebhookClient.
- types.ts
  Declares Job and WebhookPayload types used across the app.
- call-hook.test.ts
  Sends a signed mock webhook request to your local server.
- sample-jobs.json
  Mock job payload used by the test script.

## Environment Variables

Create a .env.local file in the project root:

PORT=3232
WEBHOOK_SECRET=your_shared_secret
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SERVER_URL=http://localhost:3232

Notes:

- WEBHOOK_SECRET must match between sender and server verification logic.
- SERVER_URL is used by the mock test script.

## Install

```
bun install
```

## Run The Server

```
bun run server
```

The server listens on PORT (default 3232).

## Run Mock Test

In another terminal, with the server running:

```
bun run mock-test
```

What this does:

- Reads sample-jobs.json
- Generates webhook-signature using the same canonicalization logic as the server
- Sends POST request to SERVER_URL/webhook

If successful, you should see:

- HTTP 200 in terminal output
- A new message in your Discord channel

## Request Format

The server expects JSON in this shape:

```
{
    "data": [
        {
            "title": "...",
            "url": "...",
            "company_name": "...",
            "is_fte": true,
            "is_intern": false,
            "is_test": true,
            "date_posted": 1704067200000,
            "source": "freshbatch-test",
            "degrees": ["BS Computer Science"],
            "sponsorship": "Available",
            "locations": ["Remote"],
            "category": "Engineering"
        }
    ]
}

```

## Troubleshooting

- Missing signature
  Ensure webhook-signature header is being sent.
- Invalid signature
  Ensure the sender uses the exact same payload sorting and WEBHOOK_SECRET.
- No Discord message
  Verify DISCORD_WEBHOOK_URL and check server logs for errors.
