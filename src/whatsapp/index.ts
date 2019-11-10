import os from "os";

import { Client } from "./Client";
import { firebase } from "../utils";

export default async (): Promise<Client> => {
  const osType = os.type();

  const executablePath =
    osType === "Darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : osType === "Windows_NT"
      ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      : osType === "Linux" && process.env.IS_DOCKER === "true"
      ? "google-chrome-unstable"
      : "/usr/bin/google-chrome-unstable";

  const puppeteerOptions = {
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    headless: false,
    executablePath
  };

  const session = await firebase
    .database()
    .ref("session")
    .once("value");

  const client = new Client(puppeteerOptions);

  await client.initialize(session.val());

  return client;
};
