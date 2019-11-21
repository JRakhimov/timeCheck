export type Session = {
  WAToken1: string;
  WAToken2: string;
  WABrowserId: string;
  WASecretBundle: string;
};

export interface MessageRaw {
  id: {
    id: string;
    remote: string;
    fromMe: boolean;
    _serialized: string;
  };
  t: number;
  to: string;
  from: string;
  body: string;
  type: string;
  star: boolean;
  isNewMsg: boolean;
  isForwarded: boolean;
}

export interface ChatRaw {
  id: {
    user: string;
    server: string;
    _serialized: string;
  };
  lastReceivedKey: {
    id: string;
    fromMe: boolean;
    _serialized: string;
  };
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
}

export type AppState = {
  state: State;
  stream: Stream;
  canSend: boolean;
  isState: boolean;
  launched: boolean;
  hasSynced: boolean;
  isIncognito: boolean;
  lastPhoneMessage: any;
  pendingPhoneReqs: number;

  on(event: string, callback: () => void): void;
};

export enum Stream {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  RESUMING = "RESUMING",
  SYNCING = "SYNCING"
}

export enum State {
  DEPRECATED_VERSION = "DEPRECATED_VERSION",
  SMB_TOS_BLOCK = "SMB_TOS_BLOCK",
  UNPAIRED_IDLE = "UNPAIRED_IDLE",
  UNLAUNCHED = "UNLAUNCHED",
  PROXYBLOCK = "PROXYBLOCK",
  CONNECTED = "CONNECTED",
  TOS_BLOCK = "TOS_BLOCK",
  CONFLICT = "CONFLICT",
  UNPAIRED = "UNPAIRED",
  PAIRING = "PAIRING",
  TIMEOUT = "TIMEOUT",
  OPENING = "OPENING"
}

export type WAPI = {
  AppState: AppState;
  PAIRING_STATE: State;
  CONNECTION_STREAM: Stream;

  isConnected(): boolean;
  getState(): WAPI_STATE;
};

export type WAPI_STATE = {
  phone: string;
  session: Session;
  pairingState: State;
  authRef: string | null;
  connectionState: Stream;
};

export type Account = {
  lastSentMessageDate: number;
};

export type CronMessage = {
  sentDate: number;
  responseDate?: number;
};

export interface Database {
  session?: Session;
  telegramAdmins?: {
    [key: string]: number;
  };
  qrCode?: {
    text: string;
    messages: {
      [key: string]: number;
    };
  };
  accounts: {
    [key: string]: Account;
  };
  statistics?: {
    [key: string]: {
      [key: string]: {
        [key: string]: {
          [key: string]: CronMessage;
        };
      };
    };
  };
}
