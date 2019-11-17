import Telegraf, { ContextMessageUpdate } from "telegraf";
import { dbSnapshot } from "../../../utils";

export const disconnected = (telegramClient: Telegraf<ContextMessageUpdate>) => async (): Promise<void> => {
  const db = await dbSnapshot();
  const admins = Object.values(db?.telegramAdmins || {});

  for (const admin of admins) {
    await telegramClient.telegram.sendMessage(admin, "App is disconnected from WhatsApp servers.");
  }
};
