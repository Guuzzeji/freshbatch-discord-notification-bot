const { WebhookClient, EmbedBuilder } = require("discord.js");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

function createDiscordWebhookClient(): any {
  return new WebhookClient({ url: WEBHOOK_URL });
}

function createJobsEmbed(jobs: any[]): any {
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

export async function createJobsNotification(jobs: any[]): Promise<void> {
  const webhookClient = createDiscordWebhookClient();
  const embed = createJobsEmbed(jobs);

  await webhookClient.send({
    content: "New job postings have been added!",
    username: "FreshBatch Bot",
    embeds: [embed],
  });
}
