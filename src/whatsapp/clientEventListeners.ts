import { Constants } from "./utils";
import { Client } from "./Client";
import { Session } from "./types";

const { QR_RECEIVED, AUTHENTICATION_FAILURE, AUTHENTICATED, MESSAGE_RECEIVED, READY } = Constants.Events;
import { Logger, firebase } from "../utils";
import { Message } from "./structures";

export default (client: Client): void => {
  client.on(QR_RECEIVED, (qrCode: string) => {
    const log = Logger("Event:QR_RECEIVED");

    log.info(`QR code recieved - ${qrCode}`);
  });

  client.on(AUTHENTICATION_FAILURE, (message: string) => {
    const log = Logger("Event:AUTHENTICATION_FAILURE");

    log.warn(message);
  });

  client.on(AUTHENTICATED, async (session: Session) => {
    const log = Logger("Event:AUTHENTICATED");

    log.info("Session received and updated");

    await firebase
      .database()
      .ref("session")
      .update({ ...session });
  });

  client.on(MESSAGE_RECEIVED, async (message: Message) => {
    const log = Logger("Event:MESSAGE_RECEIVED");

    log.info(message.rawMessage());

    const chat = await message.getChat();

    console.log(await chat.sendMessage("Hi"));
  });

  // client.on(DISCONNECTED, disconnectedController(strapi, bot));

  client.on(READY, () => {
    const log = Logger("Event:AUTHENTICATED");

    log.info("App is ready");
  });
};
