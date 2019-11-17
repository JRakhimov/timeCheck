import Telegraf, { Composer, ContextMessageUpdate } from "telegraf";

import { Client } from "../whatsapp/Client";
import { token, env } from "../config";
// import { Logger } from "../utils";

import { isAdmin } from "./middlewares";
import { start, status } from "./contollers";
import whatsAppClientEventListeners from "./whatsAppClientEventListeners";

export default async (whatsAppClient: Client): Promise<Composer<ContextMessageUpdate>> => {
  if (token) {
    const bot = new Telegraf(token, { telegram: { webhookReply: false } });
    // const log = Logger("Telegram:Main");

    bot.use(isAdmin);
    bot.start(start);
    bot.command("status", status(whatsAppClient));

    whatsAppClientEventListeners(whatsAppClient, bot);

    if (env === "development") {
      await bot.telegram.deleteWebhook();
      await bot.startPolling();
    }

    return bot;
  }

  throw new Error("Token is not found!");
};
