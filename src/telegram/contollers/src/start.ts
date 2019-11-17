import { ContextMessageUpdate } from "telegraf";

export const start = async (ctx: ContextMessageUpdate): Promise<void> => {
  await ctx.reply(
    "Available commands:\n/status - Get application status information\n/regenerate - Regenerate new QR code"
  );
};
