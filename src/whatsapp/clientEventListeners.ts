import { Constants } from "./utils";
import { Client } from "./Client";

const { QR_RECEIVED, AUTHENTICATION_FAILURE, AUTHENTICATED, MESSAGE_RECEIVED, READY, DISCONNECTED } = Constants.Events;

import {
  readyController,
  qrReceivedController,
  authFailureController,
  disconnectedController,
  authenticatedController,
  messageReceivedController
} from "./controllers";

export default (client: Client): void => {
  client.on(READY, readyController);

  client.on(QR_RECEIVED, qrReceivedController);

  client.on(DISCONNECTED, disconnectedController);

  client.on(AUTHENTICATED, authenticatedController);

  client.on(MESSAGE_RECEIVED, messageReceivedController);

  client.on(AUTHENTICATION_FAILURE, authFailureController);
};
