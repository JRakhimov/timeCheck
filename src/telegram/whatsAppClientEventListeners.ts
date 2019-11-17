import Telegraf, { ContextMessageUpdate } from "telegraf";

import { Constants } from "../whatsapp/utils";
import { Client } from "../whatsapp/Client";

const { READY, QR_RECEIVED, DISCONNECTED, AUTHENTICATED, AUTHENTICATION_FAILURE } = Constants.Events;

import { ready, qrReceived, authFailure, disconnected, authenticated } from "./eventControllers";

export default (whatsAppClient: Client, telegramClient: Telegraf<ContextMessageUpdate>): void => {
  whatsAppClient.on(READY, ready(telegramClient));

  whatsAppClient.on(QR_RECEIVED, qrReceived(telegramClient));

  whatsAppClient.on(DISCONNECTED, disconnected(telegramClient));

  whatsAppClient.on(AUTHENTICATED, authenticated(telegramClient));

  whatsAppClient.on(AUTHENTICATION_FAILURE, authFailure(telegramClient));
};
