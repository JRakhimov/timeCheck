import WhatsAppClient from "./whatsapp";
import { cronJob } from "./cron";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient();

  const cron = await cronJob(
    whatsAppClient,
    { cronTime: "*/30 * * * * *", timezone: "Asia/Tashkent" },
    { accounts: ["998998767363"], messageText: "Cron test" }
  );
  cron.start();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
