import WhatsAppClient from "./whatsapp";
import { cronJob } from "./cron";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient();

  const cron = await cronJob(whatsAppClient, "*/15 * * * * *", ["998998767363@c.us"]);
  cron.start();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
