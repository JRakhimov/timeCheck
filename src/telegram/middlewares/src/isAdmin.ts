import { ContextMessageUpdate } from "telegraf";
import { Logger, firebase } from "../../../utils";

export default async function(ctx: ContextMessageUpdate, next: (() => any) | undefined): Promise<void> {
  const log = Logger("Telegram:Middleware:isAdmin");

  const admins = await firebase
    .database()
    .ref("telegramAdmins")
    .once("value")
    .then(x => Object.values(x.val() || {}) as Array<number>);

  log.info(`Admins amount: ${admins.length}`);

  if (next && ctx.from && admins.includes(ctx.from.id)) {
    // TODO: add isAdmin true in state
    await next();
  }
}
