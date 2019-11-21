import { ContextMessageUpdate } from "telegraf";
import { Client } from "../../../whatsapp/Client";
import { onTick } from "../../../cron";

export const callTheMall = (whatsAppClient: Client) => async (ctx: ContextMessageUpdate): Promise<void> => {
  await ctx.reply("Sending the message...");

  await onTick(whatsAppClient, ctx)();
};
