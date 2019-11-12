import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export default function(): void {
  const log = Logger(`Event:${Events.DISCONNECTED}`);

  log.info("App has been disconnected");
}
