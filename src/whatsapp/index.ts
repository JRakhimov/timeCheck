import isDocker from "is-docker";
import os from "os";

import clientEventListeners from "./clientEventListeners";
import { dbSnapshot } from "../utils";
import { Client } from "./Client";

enum chromeExecutablePaths {
  WINDOWS = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  OSX = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  LINUX = "/usr/bin/google-chrome-unstable",
  DOCKER_LINUX = "google-chrome-unstable"
}

export default async (headless = true): Promise<Client> => {
  const osType = os.type();

  const executablePath: chromeExecutablePaths =
    osType === "Darwin"
      ? chromeExecutablePaths.OSX
      : osType === "Windows_NT"
      ? chromeExecutablePaths.WINDOWS
      : osType === "Linux" && isDocker()
      ? chromeExecutablePaths.DOCKER_LINUX
      : chromeExecutablePaths.LINUX;

  const puppeteerOptions = {
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    executablePath,
    headless
  };

  const db = await dbSnapshot();

  const client = new Client(puppeteerOptions);

  await client.initialize(db?.session);

  clientEventListeners(client);

  return client;
};
