import Telegraf, { ContextMessageUpdate } from "telegraf";
import { CronJob, CronTime } from "cron";
import Moment from "moment-timezone";

import { timezone, answerTimeLimit, cronMessageText } from "./config";
import { Logger, firebase, dbSnapshot } from "./utils";
import { CronMessage } from "./whatsapp/types";
import { Client } from "./whatsapp/Client";

const accountRegEx = /^[0-9]{0,}$/;

export const onTick = (
  whatsAppClient: Client,
  telegramClient: Telegraf<ContextMessageUpdate> | ContextMessageUpdate
) => async (): Promise<void> => {
  const log = Logger("CronJob");
  const moment = Moment().tz(timezone);

  if (whatsAppClient.pupPage) {
    log.info(`CronJob started: ${moment.format()}`);

    const isConnected = await whatsAppClient.isConnected();
    const db = await dbSnapshot();

    if (isConnected) {
      const accounts = Object.keys(db.accounts || {});

      for (const account of accounts) {
        if (accountRegEx.test(account)) {
          const res = await whatsAppClient.sendMessage([account, "@c.us"].join(""), cronMessageText);
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
                const message = `No response for: ${moment.format("DD MMMM HH:mm")} from ${account}`;
                const admins = Object.values(db.telegramAdmins || {});

                for (const chatID of admins) {
                  await telegramClient.telegram.sendMessage(chatID, message).catch(error => log.error(error));
                }

                log.error(message);
              }
            }, answerTimeLimit * 1000);
          }
        }
      }
    } else {
      log.error("App is not connected to the server, try regenerate new QR code by command /regenerate");
    }
  } else {
    log.error("Page is not initialized properly, try regenerate new QR code.");
  }
};

export const cronJob = (
  whatsAppClient: Client,
  telegramClient: Telegraf<ContextMessageUpdate>,
  cronTime: string
): CronJob => new CronJob(cronTime, onTick(whatsAppClient, telegramClient), undefined, false, timezone);

export { CronTime };
