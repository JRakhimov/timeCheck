import { Events } from "../../utils/src/Constants";
import { Logger, firebase } from "../../../utils";
import { Message } from "../../structures";
import { timezone } from "../../../config";
import { Database } from "../../types";

import Moment from "moment-timezone";

export default async function(message: Message): Promise<void> {
  const log = Logger(`Event:${Events.MESSAGE_RECEIVED}`);

  log.info(message.rawMessage());

  const chat = await message.getChat();

  if (message.body.toLowerCase() === "!ping") {
    await chat.sendMessage("Pong");
  }

  const db: Database = await firebase
    .database()
    .ref()
    .once("value")
    .then(x => x.val());

  const accounts = db.accounts ? Object.keys(db.accounts) : [];
  const [fromAccount] = message.from.split("@c.us");

  if (accounts.includes(fromAccount)) {
    const moment = Moment(message.t * 1000);
    moment.tz(timezone);

    const { lastSentMessageDate } = db.accounts[fromAccount];
    const messageMoment = Moment(lastSentMessageDate);

    const ref = `statistics/${messageMoment.format("MMMM/DD/HH_mm")}/${fromAccount}`;
    const month = messageMoment.format("MMMM");
    const time = messageMoment.format("HH_mm");
    const day = messageMoment.format("DD");

    const isAlreadyAnswered = db.statistics?.[month]?.[day]?.[time]?.[fromAccount]?.responseDate;

    if (moment.diff(messageMoment, "minutes") < 15 && isAlreadyAnswered == null) {
      await firebase
        .database()
        .ref(ref)
        .update({
          responseDate: message.t * 1000
        });
    }
  }
}
