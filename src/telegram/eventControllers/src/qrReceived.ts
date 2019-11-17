import Telegraf, { ContextMessageUpdate } from "telegraf";
import root from "app-root-path";
import QRCode from "qrcode";
import path from "path";

import { firebase, dbSnapshot } from "../../../utils";

export const qrReceived = (telegramClient: Telegraf<ContextMessageUpdate>) => async (qrCode: string): Promise<void> => {
  await QRCode.toFile("./resources/qr.png", qrCode, {});

  await firebase
    .database()
    .ref("qrCode")
    .set({ text: qrCode });

  const db = await dbSnapshot();
  const admins = Object.values(db?.telegramAdmins || {});

  for (const admin of admins) {
    await telegramClient.telegram.sendMessage(admin, "QR code received.");

    const source = path.join(root.toString(), "./resources/qr.png");
    const response = await telegramClient.telegram.sendPhoto(admin, { source });

    await firebase
      .database()
      .ref("qrCode/messages")
      .update({ [admin]: response.message_id });
  }
};
