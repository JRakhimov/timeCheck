import { ContextMessageUpdate } from "telegraf";
import { Client } from "../../../whatsapp/Client";

export const regenerate = (whatsAppClient: Client) => async (ctx: ContextMessageUpdate): Promise<void> => {
  await ctx.reply("Regenerating new QR code...");

  await whatsAppClient.closePage(true);
  whatsAppClient.newPage();
};
