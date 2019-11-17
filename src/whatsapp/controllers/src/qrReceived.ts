// import QRCode from "qrcode";

import { Events } from "../../utils/src/Constants";
import { Logger } from "../../../utils";

export default async function(qrCode: string): Promise<void> {
  const log = Logger(`Event:${Events.QR_RECEIVED}`);

  log.info(`QR code recieved - ${qrCode}`);

  // await QRCode.toFile("qr.png", qrCode, {}).catch(e => log.error(e));
}
