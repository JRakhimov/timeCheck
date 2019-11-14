import Moment from "moment-timezone";
import { CronJob } from "cron";

import { Client } from "./whatsapp/Client";
import { Logger, firebase } from "./utils";
import { timezone } from "./config";

const accountRegEx = /^[0-9]{0,}$/;

export const cronJob = (whatsAppClient: Client, cronTime: string, messageText: string): CronJob => {
  const onTick = async (): Promise<void> => {
    const log = Logger("CronJob");
    const moment = Moment().tz(timezone);

    if (whatsAppClient.pupPage) {
      log.info(`CronJob started: ${moment.format()}`);

      const isConnected = await whatsAppClient.isConnected();

      if (isConnected) {
        const accounts: Array<string> = await firebase
          .database()
          .ref("accounts")
          .once("value")
          .then(x => Object.keys(x.val() || {}));

        for (const account of accounts) {
          if (accountRegEx.test(account)) {
            const res = await whatsAppClient.sendMessage([account, "@c.us"].join(""), messageText);
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
    }
  };

  return new CronJob(cronTime, onTick, undefined, false, timezone);
};
