import WhatsAppClient from "./whatsapp";
import TelegramClient from "./telegram";
import { cronJob } from "./cron";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient(true);
  const telegramClient = await TelegramClient(whatsAppClient);

  const cron = await cronJob(whatsAppClient, telegramClient, "0 */2 * * * *", "Cron test");
  // cron.stop();
  cron.start();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
