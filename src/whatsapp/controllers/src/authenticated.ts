import { Events } from "../../utils/src/Constants";
import { Logger, firebase } from "../../../utils";
import { Session } from "../../types";

export default async function(session: Session): Promise<void> {
  const log = Logger(`Event:${Events.AUTHENTICATED}`);

  log.info("Session received and updated");

  await firebase
    .database()
    .ref("session")
    .update({ ...session });
}
