import Telegraf, { ContextMessageUpdate } from "telegraf";

import { Client } from "../whatsapp/Client";
import { token, host, port } from "../config";
import { Logger } from "../utils";

import { isAdmin } from "./middlewares";
import { start, status, regenerate } from "./contollers";
import whatsAppClientEventListeners from "./whatsAppClientEventListeners";

export default async (whatsAppClient: Client): Promise<Telegraf<ContextMessageUpdate>> => {
  if (token) {
    const bot = new Telegraf(token, { telegram: { webhookReply: false } });
    const log = Logger("Telegram:Main");

    bot.use(isAdmin);
    bot.start(start);
    bot.command("status", status(whatsAppClient));
    bot.command("regenerate", regenerate(whatsAppClient));

    whatsAppClientEventListeners(whatsAppClient, bot);

    if (host != null) {
      await bot.stop();
      await bot.telegram.setWebhook(`${host}/${token}`);
      await bot.startWebhook(`/${token}`, null, Number(port));
      log.info(`.::Telegram client launched via Webhooks::.`);
    } else {
      await bot.stop();
      await bot.telegram.deleteWebhook();
      await bot.startPolling();
      log.info(".::Telegram client launched via Polling::.");
    }

    return bot;
  }

  throw new Error("Token is not found!");
};
