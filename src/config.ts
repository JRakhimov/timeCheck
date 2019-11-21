import * as dotenv from "dotenv";

dotenv.config();

export const cronMessageText = process.env.CRON_MESSAGE_TEXT || "Cron message";
export const timezone: string = process.env.TIMEZONE || "Asia/Tashkent";
export const cronTwoTime = process.env.CRON_TWO_TIME || "30 * * * * *";
export const cronOneTime = process.env.CRON_ONE_TIME || "0 * * * * *";
export const port: string = process.env.PORT || "3000";
export const token = process.env.TOKEN;
export const host = process.env.HOST;
export const answerTimeLimit = 70;
