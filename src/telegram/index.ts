import Telegraf, { Composer, ContextMessageUpdate } from "telegraf";
import { Client } from "../whatsapp/Client";
import { token } from "../config";
import qrCode from "qrcode";

export default async (whatsAppClient: Client): Promise<Composer<ContextMessageUpdate>> => {
  if (token) {
    const bot = new Telegraf(token, { telegram: { webhookReply: false } });

    return bot;
  }

  throw new Error("Token is not found!");
};
