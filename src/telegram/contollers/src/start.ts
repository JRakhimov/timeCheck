import { ContextMessageUpdate } from "telegraf";

export const start = async (ctx: ContextMessageUpdate): Promise<void> => {
  await ctx.reply("Hi!");
};
