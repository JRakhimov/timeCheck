import Telegraf, { ContextMessageUpdate } from "telegraf";
import { dbSnapshot } from "../../../utils";

export const authFailure = (telegramClient: Telegraf<ContextMessageUpdate>) => async (): Promise<void> => {
  const db = await dbSnapshot();
  const admins = Object.values(db?.telegramAdmins || {});

  for (const admin of admins) {
    await telegramClient.telegram.sendMessage(admin, "Cannot restore previous session, please regenerate new QR code.");
  }
};
