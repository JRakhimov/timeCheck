import * as dotenv from "dotenv";

dotenv.config();

export const timezone: string = process.env.TIMEZONE || "Asia/Tashkent";
export const env: string = process.env.ENV || "development";
export const token: string | undefined = process.env.TOKEN;
export const host: string | undefined = process.env.HOST;
export const port: string = process.env.PORT || "3000";
export const answerTimeLimit = 70;
