import WhatsAppClient from "./whatsapp";
import { timezone } from "./config";
import { firebase } from "./utils";
import { cronJob } from "./cron";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient(false);

  const accounts: Array<string> = await firebase
    .database()
    .ref("accounts")
    .once("value")
    .then(x => Object.keys(x.val() || {}));

  if (accounts.length) {
    const cron = await cronJob(
      whatsAppClient,
      { cronTime: "*/30 * * * * *", timezone },
      { messageText: "Cron test", accounts }
    );
    cron.stop();
    // cron.start();
  }
};

try {
  Main();
} catch (error) {
  console.log(error);
}
