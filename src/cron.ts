import Moment from "moment-timezone";
import { CronJob } from "cron";

import { Client } from "./whatsapp/Client";
import { Logger, firebase, dbSnapshot } from "./utils";
import { timezone, answerTimeLimit } from "./config";
import { CronMessage } from "./whatsapp/types";
import Telegraf, { ContextMessageUpdate } from "telegraf";

const accountRegEx = /^[0-9]{0,}$/;

export const cronJob = (
  whatsAppClient: Client,
  telegramClient: Telegraf<ContextMessageUpdate>,
  cronTime: string,
  messageText: string
): CronJob => {
  const onTick = async (): Promise<void> => {
    const log = Logger("CronJob");
    const moment = Moment().tz(timezone);

    if (whatsAppClient.pupPage) {
      log.info(`CronJob started: ${moment.format()}`);

      const isConnected = await whatsAppClient.isConnected();

      if (isConnected) {
        const db = await dbSnapshot();
        const accounts = Object.keys(db.accounts || {});

        for (const account of accounts) {
          if (accountRegEx.test(account)) {
            const res = await whatsAppClient.sendMessage([account, "@c.us"].join(""), messageText);
            const ref = `statistics/${moment.format("MMMM/DD/HH_mm")}/${account}`;

            if (res === "success") {
              const timestamp = new Date().getTime();
              await Promise.all([
                firebase
                  .database()
                  .ref(ref)
                  .set({
                    sentDate: timestamp
                  }),
                firebase
                  .database()
                  .ref(`accounts/${account}`)
                  .set({
                    lastSentMessageDate: timestamp
                  })
              ]);

              setTimeout(async () => {
                const cronMessage: CronMessage = await firebase
                  .database()
                  .ref(ref)
                  .once("value")
                  .then(x => x.val());

                if (cronMessage.responseDate == null) {
                  const admins = Object.values(db.telegramAdmins);
                  const message = `No response for: ${moment.format("DD MMMM HH:mm")} from ${account}`;

                  for (const chatID of admins) {
                    telegramClient.telegram.sendMessage(chatID, message);
                  }

                  log.error(message);
                }
              }, answerTimeLimit * 1000);
            }
          }
        }
      }
    }
  };

  return new CronJob(cronTime, onTick, undefined, false, timezone);
};
