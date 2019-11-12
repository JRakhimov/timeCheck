import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export default function(): void {
  const log = Logger(`Event:${Events.AUTHENTICATED}`);

  log.info("App is ready");
}
