export type Session = {
  WASecretBundle: string;
  WABrowserId: string;
  WAToken1: string;
  WAToken2: string;
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
  isForwarded: boolean;
  isNewMessage: boolean;
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
