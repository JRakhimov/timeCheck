/* eslint-disable @typescript-eslint/ban-ts-ignore */
import EventEmitter from "events";
import puppeteer, { LaunchOptions, Browser, Page } from "puppeteer-core";

import { Logger } from "../utils";
import { Constants, exposeStoreAndWAPI } from "./utils";

import { Session, MessageRaw, WAPI, AppState } from "./types";
import { Message } from "./structures";

export class Client extends EventEmitter {
  pupBrowser: Browser | null = null;
  pupPage: Page | null = null;
  options: LaunchOptions = {};
  retries = 0;

  constructor(options: LaunchOptions = {}) {
    super();

    this.options = { ...Constants.DefaultOptions, ...options };
  }

  async initialize(session?: Session): Promise<void> {
    const log = Logger("Client:Browser");

    log.info("Opening browser...");
    this.pupBrowser = await puppeteer.launch(this.options);
    log.info("Browser opened </>");

    this.newPage(session);
  }

  async newPageWithNewContext(): Promise<Page> {
    if (this.pupBrowser) {
      const context = await this.pupBrowser.createIncognitoBrowserContext();
      const page = await context.newPage();

      return page;
    }

    throw new Error("Browser is not launched, please call initialize() first");
  }

  async newPage(session?: Session): Promise<void> {
    const log = Logger("Client:Page");

    log.info("Opening new page...");
    const page = await this.newPageWithNewContext();

    await page.setUserAgent(Constants.USER_AGENT);

    if (session) {
      await page.evaluateOnNewDocument((session: Session) => {
        window.localStorage.clear();
        window.localStorage.setItem("WASecretBundle", session.WASecretBundle);
        window.localStorage.setItem("WABrowserId", session.WABrowserId);
        window.localStorage.setItem("WAToken1", session.WAToken1);
        window.localStorage.setItem("WAToken2", session.WAToken2);
      }, session);
    }

    await page.goto(Constants.WHATSAPP_WEB_URL, { waitUntil: "networkidle0", timeout: 0 });

    log.info("Page opened </>");

    if (session) {
      // Check if session restore was successfull
      try {
        await page.waitForSelector(Constants.Selectors.PHONE_CONNECTED, { timeout: 5000 });
      } catch (err) {
        if (err.name === "TimeoutError") {
          if (this.retries === 3) {
            this.emit(Constants.Events.AUTHENTICATION_FAILURE, "Unable to log in. Are the session details valid?");

            await this.closePage(true);
            await this.newPage();
            this.retries = 0;

            return;
          }

          await this.closePage(false);
          await this.newPage();
          this.retries += 1;

          return;
        }

        throw err;
      }
    } else {
      // Wait for QR Code
      await page.waitForSelector(Constants.Selectors.QR_CONTAINER);

      const qr = await page.$eval(Constants.Selectors.QR_VALUE, node => node.getAttribute("data-ref"));
      this.emit(Constants.Events.QR_RECEIVED, qr);

      // Wait for code scan
      await page.waitForSelector(Constants.Selectors.PHONE_CONNECTED, { timeout: 0 });
    }

    await page.addScriptTag({ path: require.resolve("moduleraid") });
    await page.evaluate(exposeStoreAndWAPI);

    const localStorage: Session = JSON.parse(await page.evaluate(() => JSON.stringify(window.localStorage)));
    const newSession: Session = {
      WASecretBundle: localStorage.WASecretBundle,
      WABrowserId: localStorage.WABrowserId,
      WAToken1: localStorage.WAToken1,
      WAToken2: localStorage.WAToken2
    };

    this.emit(Constants.Events.AUTHENTICATED, newSession);

    await page.exposeFunction("onAddMessageEvent", async (messageRaw: MessageRaw) => {
      if (messageRaw.id.fromMe || !messageRaw.isNewMsg) {
        return;
      }

      page && this.emit(Constants.Events.MESSAGE_RECEIVED, new Message(page, messageRaw));
    });

    await page.exposeFunction("onConnectionChangedEvent", async (_Constants, AppState: AppState) => {
      const { CONNECTION_STREAM, PAIRING_STATE } = _Constants;
      const { stream, state } = AppState;

      if (stream === CONNECTION_STREAM.DISCONNECTED || state === PAIRING_STATE.DISCONNECTED) {
        this.emit(Constants.Events.DISCONNECTED, { stream, state });
      }
    });

    await page.evaluate(() => {
      // @ts-ignore
      const { PAIRING_STATE, CONNECTION_STREAM, AppState } = window.WAPI as WAPI;

      // @ts-ignore
      Store.Msg.on("add", onAddMessageEvent);

      AppState.on("change:state change:stream", () => {
        const { state, stream } = AppState;

        // @ts-ignore
        onConnectionChangedEvent({ PAIRING_STATE, CONNECTION_STREAM }, { state, stream });
      });
    });

    this.emit(Constants.Events.READY);

    this.pupPage = page;
  }

  async closePage(removeSession: boolean): Promise<void> {
    const close = async (page: Page): Promise<void> => {
      if (page && !page.isClosed()) {
        if (removeSession) {
          await page.evaluate(() => window.localStorage.clear());
        }

        try {
          await page.close();
        } catch (error) {
          if (error.name !== "Target closed") {
            throw new Error(error);
          }
        }
      }
    };

    const pages = (await this.pupBrowser?.pages()) || [];

    for (const page of pages) {
      if (page.url() !== "about:blank") {
        await close(page);
      }
    }

    this.pupPage = null;
  }

  async sendMessage(chatID: string, message: string): Promise<void | string> {
    if (this.pupPage) {
      return this.pupPage.evaluate(
        // @ts-ignore
        (chatID, message) => Store.sendTextMsgToChat(Store.Chat.get(chatID), message),
        chatID,
        message
      );
    } else {
      throw new Error("Browser is not launched, please call initialize() first");
    }
  }

  async isConnected(): Promise<boolean> {
    if (this.pupPage && this.pupBrowser) {
      // @ts-ignore
      return this.pupPage.evaluate(() => (window.WAPI as WAPI).isConnected());
    } else {
      throw new Error("Browser or page is not launched, please call initialize() first");
    }
  }
}
