/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Page } from "puppeteer";

import { MessageRaw } from "../../types";
import { Chat } from "./Chat";

export class Message implements MessageRaw {
  page: Page;

  id: MessageRaw["id"];

  t: number;
  to: string;
  from: string;
  body: string;
  type: string;
  star: boolean;
  isForwarded: boolean;
  isNewMsg: boolean;

  constructor(page: Page, messageData: MessageRaw) {
    this.page = page;

    this.t = messageData.t;
    this.id = messageData.id;
    this.to = messageData.to;
    this.from = messageData.from;
    this.star = messageData.star;
    this.body = messageData.body;
    this.type = messageData.type;
    this.isNewMsg = messageData.isNewMsg;
    this.isForwarded = messageData.isForwarded;
  }

  rawMessage(): MessageRaw {
    return {
      t: this.t,
      id: this.id,
      to: this.to,
      from: this.from,
      star: this.star,
      body: this.body,
      type: this.type,
      isNewMsg: this.isNewMsg,
      isForwarded: this.isForwarded
    };
  }

  /**
   * Get chat instance by ID
   * @param {string} chatID
   */
  async getChatById(chatID: string): Promise<Chat> {
    // @ts-ignore
    const chat = await this.page.evaluate(chatID => Store.getChat(chatID), chatID);

    return new Chat(this.page, chat);
  }

  /**
   * Returns the Chat this message was sent in
   */
  getChat(): Promise<Chat> {
    return this.getChatById(this.from);
  }

  /**
   * Sends a message as a reply. If chatID is specified, it will be sent
   * through the specified Chat. If not, it will send the message
   * in the same Chat as the original message was sent.
   * @param {string} message
   * @param {?string} chatID
   */
  // async reply(message: string, chatID: string) {
  //   if (!chatID) {
  //     chatID = this.from;
  //   }

  //   return await this.page.evaluate(
  //     (chatID, message, quotedMessageId) => {
  //       const quotedMessage = Store.Msg.get(quotedMessageId);

  //       if (quotedMessage.canReply()) {
  //         const chat = Store.Chat.get(chatID);

  //         chat.composeQuotedMsg = quotedMessage;
  //         window.Store.SendMessage(chat, message, { quotedMsg: quotedMessage });
  //         chat.composeQuotedMsg = null;
  //       } else {
  //         throw new Error("This message cannot be replied to.");
  //       }
  //     },
  //     chatID,
  //     message,
  //     this.id._serialized
  //   );
  // }

  // async sendDocument(imgBase64, chatID, filename, caption) {
  //   if (!chatID) {
  //     chatID = this.from;
  //   }

  //   await this.page.evaluate(
  //     (chatID, imgBase64, filename, caption) => {
  //       const idUser = new Store.UserConstructor(chatID, { intentionallyUsePrivateConstructor: true });

  //       return Store.Chat.find(idUser).then(chat => {
  //         const mediaBlob = Store.base64ImageToFile(imgBase64, filename);

  //         const mc = new Store.MediaCollection();

  //         mc.processFiles([mediaBlob], chat, 1).then(() => {
  //           const media = mc.models[0];

  //           media.sendToChat(chat, { caption: caption });
  //         });
  //       });
  //     },
  //     chatID,
  //     imgBase64,
  //     filename,
  //     caption
  //   );
  // }
}
