import dotenv from "dotenv";
import { WebhookClient, EmbedBuilder } from "discord.js";

dotenv.config();
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

function createDiscordWebhookClient(): WebhookClient {
  return new WebhookClient({ url: WEBHOOK_URL });
}

function createJobsEmbed(jobs: any[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("New Job Postings")
    .setDescription("Latest job opportunities");

  jobs.forEach((job) => {
    embed.addFields({
      name: job.title || "Untitled",
      value: job.url || "No URL provided",
      inline: false,
    });
  });

  return embed;
}

function chunkJobs(jobs: any[], chunkSize: number): any[][] {
  const chunks: any[][] = [];

  for (let i = 0; i < jobs.length; i += chunkSize) {
    chunks.push(jobs.slice(i, i + chunkSize));
  }

  return chunks;
}

export async function createJobsNotification(jobs: any[]): Promise<void> {
  const webhookClient = createDiscordWebhookClient();
  const jobChunks = chunkJobs(jobs, 24);

  for (const chunk of jobChunks) {
    const embed = createJobsEmbed(chunk);

    await webhookClient.send({
      content: "New job postings have been added!",
      username: "FreshBatch Bot",
      embeds: [embed],
    });
  }
}
