/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Page } from "puppeteer-core";

import { ChatRaw } from "../../types";

export class Chat implements ChatRaw {
  page: Page;

  id: ChatRaw["id"];
  lastReceivedKey: ChatRaw["lastReceivedKey"];

  t: number;
  pin: number;
  name: string;
  isGroup: boolean;
  notSpam: boolean;
  archive: boolean;
  isReadOnly: boolean;
  unreadCount: number;
  pendingMsgs: boolean;
  formattedTitle: string;
  muteExpiration: number;

  constructor(page: Page, chatData: ChatRaw) {
    this.page = page;

    this.t = chatData.t;
    this.id = chatData.id;
    this.pin = chatData.pin;
    this.name = chatData.name;
    this.archive = chatData.archive;
    this.notSpam = chatData.notSpam;
    this.isGroup = chatData.isGroup;
    this.isReadOnly = chatData.isReadOnly;
    this.pendingMsgs = chatData.pendingMsgs;
    this.unreadCount = chatData.unreadCount;
    this.formattedTitle = chatData.formattedTitle;
    this.muteExpiration = chatData.muteExpiration;
    this.lastReceivedKey = chatData.lastReceivedKey;
  }

  async sendMessage(chatID: string, message: string) {
    // @ts-ignore
    return this.page.evaluate((chatID, message) => Store.SendMessage(Store.Chat.get(chatID), message), chatID, message);
  }

  async reply(message: string) {
    return this.sendMessage(this.id._serialized, message);
  }

  // getMe() {
  //   return this.page.getMe();
  // }
}
