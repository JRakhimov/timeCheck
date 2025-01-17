import Moment from "moment-timezone";

import { Logger, firebase, dbSnapshot } from "../../../utils";
import { Events } from "../../utils/src/Constants";
import { Message } from "../../structures";
import { timezone, answerTimeLimit } from "../../../config";
import { Database } from "../../types";

export const messageReceived = async (message: Message): Promise<void> => {
  const log = Logger(`Event:${Events.MESSAGE_RECEIVED}`);

  log.info(message.rawMessage());

  const chat = await message.getChat();

  if (message.body.toLowerCase() === "!ping") {
    await chat.sendMessage("Pong");
  }

  const db: Database = await dbSnapshot();

  const accounts = db.accounts ? Object.keys(db.accounts) : [];
  const [fromAccount] = message.from.split("@c.us");

  if (accounts.includes(fromAccount)) {
    const moment = Moment(message.t * 1000).tz(timezone);

    const { lastSentMessageDate } = db.accounts[fromAccount];
    const messageMoment = Moment(lastSentMessageDate).tz(timezone);

    const ref = `statistics/${messageMoment.format("MMMM/DD/HH_mm")}/${fromAccount}`;
    const month = messageMoment.format("MMMM");
    const time = messageMoment.format("HH_mm");
    const day = messageMoment.format("DD");

    const isAlreadyAnswered = db.statistics?.[month]?.[day]?.[time]?.[fromAccount]?.responseDate;
    const differenceWithLastMessage = moment.diff(messageMoment, "seconds");

    if (differenceWithLastMessage < answerTimeLimit && isAlreadyAnswered == null) {
      await firebase
        .database()
        .ref(ref)
        .update({
          responseDate: message.t * 1000
        });
    }
  }
};
