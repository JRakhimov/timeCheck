import Moment from "moment-timezone";
import { CronJob } from "cron";

import { Client } from "./whatsapp/Client";
import { Logger, firebase } from "./utils";

const accountRegEx = /^[0-9]{0,}$/;

interface CronOptions {
  cronTime: string;
  timezone: string;
}

interface MessageOptions {
  accounts: Array<string>;
  messageText: string;
}

export const cronJob = (whatsAppClient: Client, cronOptions: CronOptions, messageOptions: MessageOptions): CronJob => {
  const onTick = async (): Promise<void> => {
    const log = Logger("CronJob");
    const moment = Moment();

    moment.tz(cronOptions.timezone);

    log.info(`CronJob started: ${moment.format()}`);

    if (whatsAppClient.pupPage) {
      const isConnected = await whatsAppClient.isConnected();

      for (const account of messageOptions.accounts) {
        if (isConnected && accountRegEx.test(account)) {
          const day = moment.format("DD");
          const month = moment.format("MMMM");
          const time = moment.format("HH_mm");

          const res = await whatsAppClient.sendMessage([account, "@c.us"].join(""), messageOptions.messageText);

          if (res === "success") {
            const timestamp = new Date().getTime();
            const promises = [
              firebase
                .database()
                .ref(`${month}/${day}/${time}/${account}`)
                .set({
                  sentDate: timestamp
                }),
              firebase
                .database()
                .ref(`accounts/${account}`)
                .set({
                  lastSentMessageDate: timestamp
                })
            ];

            await Promise.all(promises);
          }
        }
      }
    }
  };

  return new CronJob(cronOptions.cronTime, onTick, undefined, false, cronOptions.timezone); // "Europe/Moscow"
};
