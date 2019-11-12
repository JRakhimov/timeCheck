import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export default function(qrCode: string): void {
  const log = Logger(`Event:${Events.QR_RECEIVED}`);

  log.info(`QR code recieved - ${qrCode}`);
}
