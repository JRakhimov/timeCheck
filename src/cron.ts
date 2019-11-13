import Moment from "moment-timezone";
import { CronJob } from "cron";

import { Client } from "./whatsapp/Client";
import { Logger, firebase } from "./utils";

const accountRegEx = /^[0-9]{0,}@c.us$/;

export const cronJob = (
  whatsAppClient: Client,
  cronTime: string,
  accounts: Array<string>,
  timezone = "Asia/Tashkent"
): CronJob => {
  const onTick = async (): Promise<void> => {
    const log = Logger("CronJob");
    const moment = Moment();

    moment.tz(timezone);

    log.info(`CronJob started: ${moment.format()}`);

    const wapi = await whatsAppClient.clientState();

    if (whatsAppClient.pupPage && wapi.isConnected()) {
      for (const account of accounts) {
        if (accountRegEx.test(account)) {
          const day = moment.format("DD");
          const month = moment.format("MMMM");
          const time = moment.format("HH_mm");

          const res = await whatsAppClient.sendMessage(account, "Cron test");
          const [phone] = account.split("@c.us");

          await firebase
            .database()
            .ref(`${month}/${day}/${time}/${phone}`)
            .set(res);
        }
      }
    } else {
      log.info("Some error log");
    }
  };

  return new CronJob(cronTime, onTick, undefined, false, timezone); // "Europe/Moscow"
};
