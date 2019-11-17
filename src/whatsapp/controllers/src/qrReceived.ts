import QRCode from "qrcode";

import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export default function(qrCode: string): void {
  const log = Logger(`Event:${Events.QR_RECEIVED}`);

  log.info(`QR code recieved - ${qrCode}`);

  QRCode.toFile("qr.png", qrCode, {}).catch(e => log.error(e));
}
