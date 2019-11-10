import { Constants } from "./utils";
import { Client } from "./Client";
import { Session } from "./types";

const { QR_RECEIVED, AUTHENTICATION_FAILURE, AUTHENTICATED, READY } = Constants.Events;
import { Logger, firebase } from "../utils";

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

  // client.on(MESSAGE_RECEIVED, (ctx) => {

  // });

  // client.on(DISCONNECTED, disconnectedController(strapi, bot));

  client.on(READY, () => {
    const log = Logger("Event:AUTHENTICATED");

    log.info("App is ready");
  });
};
