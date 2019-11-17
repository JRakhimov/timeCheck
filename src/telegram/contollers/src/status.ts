import { ContextMessageUpdate } from "telegraf";
import { Client } from "../../../whatsapp/Client";

export const status = (whatsAppClient: Client) => async (ctx: ContextMessageUpdate): Promise<void> => {
  try {
    const status = await whatsAppClient.isConnected();

    ctx.reply(`App ${status ? "connected" : "disconnected"} to WhatsApp servers`);
  } catch (error) {
    ctx.reply(error.message);
  }
};
