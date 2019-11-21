import { timezone, cronOneTime, cronTwoTime } from "./config";
import { Logger, randomIntInclusive } from "./utils";
import { cronJob, CronTime } from "./cron";
import WhatsAppClient from "./whatsapp";
import TelegramClient from "./telegram";

const Main = async (): Promise<void> => {
  const log = Logger("Main");
  const whatsAppClient = await WhatsAppClient();
  const telegramClient = await TelegramClient(whatsAppClient);

  const cronOne = await cronJob(whatsAppClient, telegramClient, cronOneTime);
  const cronTwo = await cronJob(whatsAppClient, telegramClient, cronTwoTime);

  cronOne.start();
  cronTwo.start();
  log.info(`First cron started, next tick: ${cronOne.nextDate().toString()}`);
  log.info(`Second cron started, next tick: ${cronTwo.nextDate().toString()}`);

  cronOne.addCallback(() => {
    const randomHour = randomIntInclusive(10, 17);
    const randomMinute = randomIntInclusive(0, 60);
    cronTwo.setTime(new CronTime(`0 ${randomMinute} ${randomHour} * * *`, timezone));
    log.info(`Next tick time for cronTwo changed to ${cronTwo.nextDate().toString()}`);
  });
};

try {
  Main();
} catch (error) {
  console.log(error);
}
