import { Constants } from "./utils";
import { Client } from "./Client";

const { READY, QR_RECEIVED, DISCONNECTED, AUTHENTICATED, MESSAGE_RECEIVED, AUTHENTICATION_FAILURE } = Constants.Events;

import { ready, qrReceived, authFailure, disconnected, authenticated, messageReceived } from "./controllers";

export default (client: Client): void => {
  client.on(READY, ready);

  client.on(QR_RECEIVED, qrReceived);

  client.on(DISCONNECTED, disconnected);

  client.on(AUTHENTICATED, authenticated);

  client.on(MESSAGE_RECEIVED, messageReceived);

  client.on(AUTHENTICATION_FAILURE, authFailure);
};
