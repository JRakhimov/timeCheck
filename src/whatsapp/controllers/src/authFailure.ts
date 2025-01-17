import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export const authFailure = (message: string): void => {
  const log = Logger(`Event:${Events.AUTHENTICATION_FAILURE}`);

  log.warn(message);
};
