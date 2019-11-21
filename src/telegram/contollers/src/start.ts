import { ContextMessageUpdate } from "telegraf";

export const start = async (ctx: ContextMessageUpdate): Promise<void> => {
  const commands = [
    "/status - Get application status information",
    "/regenerate - Regenerate new QR code",
    "/callthemall - Run cron job immediately"
  ];

  await ctx.reply(`Available commands: \n${commands.join("\n")}`);
};
