import WhatsAppClient from "./whatsapp";
import { cronJob } from "./cron";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient(false);

  const cron = await cronJob(whatsAppClient, "*/30 * * * * *", "Cron test");
  cron.stop();
  // cron.start();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
