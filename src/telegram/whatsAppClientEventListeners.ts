import Telegraf, { ContextMessageUpdate } from "telegraf";

import { Constants } from "../whatsapp/utils";
import { Client } from "../whatsapp/Client";

const { READY, QR_RECEIVED, DISCONNECTED, IS_CONNECTED, AUTHENTICATED, AUTHENTICATION_FAILURE } = Constants.Events;

import { ready, qrReceived, authFailure, isConnected, disconnected, authenticated } from "./eventControllers";

export default (whatsAppClient: Client, telegramClient: Telegraf<ContextMessageUpdate>): void => {
  whatsAppClient.on(READY, ready(telegramClient));

  whatsAppClient.on(QR_RECEIVED, qrReceived(telegramClient));

  whatsAppClient.on(IS_CONNECTED, isConnected(telegramClient));

  whatsAppClient.on(DISCONNECTED, disconnected(telegramClient));

  whatsAppClient.on(AUTHENTICATED, authenticated(telegramClient));

  whatsAppClient.on(AUTHENTICATION_FAILURE, authFailure(telegramClient));
};
