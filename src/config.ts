import * as dotenv from "dotenv";

dotenv.config();

export const timezone: string = process.env.TIMEZONE || "Asia/Tashkent";
export const isDocker: boolean = process.env.IS_DOCKER !== null;
