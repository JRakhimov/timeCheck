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
    const moment = Moment().tz(cronOptions.timezone);

    if (whatsAppClient.pupPage) {
      log.info(`CronJob started: ${moment.format()}`);

      const isConnected = await whatsAppClient.isConnected();

      for (const account of messageOptions.accounts) {
        if (isConnected && accountRegEx.test(account)) {
          const res = await whatsAppClient.sendMessage([account, "@c.us"].join(""), messageOptions.messageText);
          const ref = `statistics/${moment.format("MMMM/DD/HH_mm")}/${account}`;

          if (res === "success") {
            const timestamp = new Date().getTime();
            const promises = [
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
            ];

            await Promise.all(promises);
          }
        }
      }
    }
  };

  return new CronJob(cronOptions.cronTime, onTick, undefined, false, cronOptions.timezone);
};
