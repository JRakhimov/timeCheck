import root from "app-root-path";
import path from "path";
import fs from "fs";

import Telegraf, { ContextMessageUpdate } from "telegraf";
import { firebase, dbSnapshot } from "../../../utils";

export const authenticated = (telegramClient: Telegraf<ContextMessageUpdate>) => async (): Promise<void> => {
  const db = await dbSnapshot();
  const admins = Object.values(db?.telegramAdmins || {});
  const telegramMessages = db?.qrCode?.messages;

  fs.unlinkSync(path.join(root.toString(), "./resources/qr.png"));

  await firebase
    .database()
    .ref("qrCode")
    .set(null);

  for (const admin of admins) {
    await telegramClient.telegram.sendMessage(admin, "Session restored and updated.");
  }

  if (telegramMessages && Object.keys(telegramMessages).length) {
    for (const chat in telegramMessages) {
      if (telegramMessages.hasOwnProperty(chat)) {
        const message = telegramMessages[chat];

        await telegramClient.telegram.deleteMessage(chat, message);
      }
    }
  }
};
