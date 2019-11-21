import Telegraf, { ContextMessageUpdate } from "telegraf";
import { dbSnapshot } from "../../../utils";

export const isConnected = (telegramClient: Telegraf<ContextMessageUpdate>) => async (
  isConnected: boolean
): Promise<void> => {
  if (!isConnected) {
    const db = await dbSnapshot();
    const admins = Object.values(db?.telegramAdmins || {});

    for (const admin of admins) {
      await telegramClient.telegram.sendMessage(
        admin,
        "App is not connected to the server, try regenerate new QR code by command /regenerate"
      );
    }
  }
};
