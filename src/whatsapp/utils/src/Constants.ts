import { LaunchOptions } from "puppeteer-core";

export const WHATSAPP_WEB_URL = "https://web.whatsapp.com/";

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36";

export const DefaultOptions: LaunchOptions = {
  headless: true
};

export const Selectors = {
  PHONE_CONNECTED: "._1wSzK",
  QR_CONTAINER: "._2d3Jz",
  QR_EXPIRED: "._1MOym",
  QR_VALUE: "._1pw2F"
};

export enum Events {
  AUTHENTICATION_FAILURE = "auth_failure",
  AUTHENTICATED = "authenticated",
  DISCONNECTED = "disconnected",
  IS_CONNECTED = "is_connected",
  MESSAGE_RECEIVED = "message",
  QR_RECEIVED = "qr",
  READY = "ready"
}

export enum MessageTypes {
  DOCUMENT = "document",
  STICKER = "sticker",
  VIDEO = "video",
  AUDIO = "audio",
  IMAGE = "image",
  VOICE = "ptt",
  TEXT = "chat"
}

export enum ChatTypes {
  UNKNOWN = "unknown",
  GROUP = "group",
  SOLO = "solo"
}
