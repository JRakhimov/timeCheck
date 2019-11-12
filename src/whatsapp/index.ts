import os from "os";

import { Client } from "./Client";
import { firebase } from "../utils";
import clientEventListeners from "./clientEventListeners";

enum chromeExecutablePathes {
  WINDOWS = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  OSX = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  LINUX = "/usr/bin/google-chrome-unstable",
  DOCKER_LINUX = "google-chrome-unstable"
}

export default async (): Promise<Client> => {
  const osType = os.type();

  const executablePath: chromeExecutablePathes =
    osType === "Darwin"
      ? chromeExecutablePathes.OSX
      : osType === "Windows_NT"
      ? chromeExecutablePathes.WINDOWS
      : osType === "Linux" && process.env.IS_DOCKER
      ? chromeExecutablePathes.DOCKER_LINUX
      : chromeExecutablePathes.LINUX;

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

  clientEventListeners(client);

  return client;
};
