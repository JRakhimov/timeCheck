import WhatsAppClient from "./whatsapp";
import { cronJob } from "./cron";
import { timezone } from "./config";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient(false);

  const cron = await cronJob(
    whatsAppClient,
    { cronTime: "*/30 * * * * *", timezone },
    { accounts: ["998998767363"], messageText: "Cron test" }
  );
  cron.stop();
  // cron.start();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
