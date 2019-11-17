import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export const ready = (): void => {
  const log = Logger(`Event:${Events.READY}`);

  log.info("App is ready");
};
