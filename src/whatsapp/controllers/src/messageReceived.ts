import { Events } from "../../utils/src/Constants";
import { Message } from "../../structures";
import { Logger } from "../../../utils";

export default async function(message: Message): Promise<void> {
  const log = Logger(`Event:${Events.MESSAGE_RECEIVED}`);

  log.info(message.rawMessage());

  const chat = await message.getChat();

  console.log(await chat.sendMessage("Hi"));
}