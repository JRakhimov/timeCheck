/* eslint-disable @typescript-eslint/ban-ts-ignore */
import EventEmitter from "events";
import puppeteer, { Browser, LaunchOptions, Page } from "puppeteer-core";

import { Logger } from "../utils";
import { Constants, exposeStoreAndWAPI } from "./utils";

import { AppState, MessageRaw, Session, WAPI } from "./types";
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
      return await context.newPage();
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
      // Check if session restore was successful
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

          this.retries += 1;
          log.info(`Trying to restore the session: ${this.retries}`);

          await this.closePage(false);
          await this.newPage(session);

          return;
        }

        throw err;
      }
    } else {
      // Wait for QR Code
      await page.waitForSelector(Constants.Selectors.QR_CONTAINER);

      const qr = await page.$eval(Constants.Selectors.QR_VALUE, node => node.getAttribute("data-ref"));

      if (qr == null) {
        await page.close();

        try {
          await this.closePage(true);
          await this.newPage();
        } catch (error) {
          log.error(error);
        }

        return;
      }

      this.emit(Constants.Events.QR_RECEIVED, qr);

      // Wait for code scan
      try {
        await page.waitForSelector(Constants.Selectors.PHONE_CONNECTED, { timeout: 0 });
      } catch (error) {
        const err: Error = error;

        if (err.message.includes("Target closed.")) {
          return;
        }

        throw new Error(error);
      }
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
        if (this.retries === 0) {
          await this.closePage(false);
          await this.newPage(session);
        }

        this.retries++;

        if (this.retries > 0) {
          this.emit(Constants.Events.DISCONNECTED, { stream, state });
          this.retries = 0;
        }
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
    const log = Logger("Client:Page");

    log.info(`Closing page... removeSession: ${removeSession}`);

    const close = async (page: Page): Promise<void> => {
      if (page && !page.isClosed()) {
        if (removeSession) {
          await page.evaluate(() => window.localStorage.clear());
        }

        await page.close();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
        (chatID, message) => {
          // @ts-ignore
          const chat = Store.Chat.get(chatID);

          if (chat != null) {
            // @ts-ignore
            Store.sendTextMsgToChat(chat, message);
            return;
          }

          // @ts-ignore
          const recentChat = Store.Chat.models[0];
          // @ts-ignore
          recentChat.id = new Store.UserConstructor(chatID, { intentionallyUsePrivateConstructor: true });
          // @ts-ignore
          Store.sendTextMsgToChat(recentChat, message);
        },
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
      const isConnected = await this.pupPage.evaluate(() => (window.WAPI as WAPI).isConnected());

      this.emit(Constants.Events.IS_CONNECTED, isConnected);

      return isConnected;
    } else {
      throw new Error("Browser or page is not launched, please call initialize() first");
    }
  }
}
