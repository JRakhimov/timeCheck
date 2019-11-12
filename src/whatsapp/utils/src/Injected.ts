import { ChatRaw, WAPI_STATE, State, Stream, AppState } from "../../types";

type StreamModule = {
  STATE: State;
  STREAM: Stream;
  default: AppState;
};

/* eslint-disable @typescript-eslint/ban-ts-ignore */
export function exposeStoreAndWAPI(): void {
  // @ts-ignore
  const { mR } = window;

  const { default: Store } = mR.findModule("Chat")[1];
  const [{ sendTextMsgToChat }] = mR.findModule("sendTextMsgToChat");
  const [{ STATE, STREAM, default: appState }]: [StreamModule] = mR.findModule("STREAM");

  const [{ default: MediaCollection }] = mR
    .findModule("default")
    // @ts-ignore
    .filter(x => x.default.prototype && x.default.prototype.processFiles != null);
  const [{ default: UserConstructor }] = mR
    .findModule("default")
    // @ts-ignore
    .filter(x => x.default.prototype && x.default.prototype.isServer && x.default.prototype.isUser != null);
  // @ts-ignore
  const base64ImageToFile = (b64Data, filename): File => {
    const arr = b64Data.split(",");

    const mime = arr[0].match(/:(.*?);/)[1];

    const bstr = atob(arr[1]);

    let n = bstr.length;

    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const getChatModel = (chat: any): ChatRaw => {
    const res = chat.serialize();

    res.isGroup = chat.isGroup;
    res.formattedTitle = chat.formattedTitle;

    if (chat.groupMetadata) {
      res.groupMetadata = chat.groupMetadata.serialize();
    }

    return res;
  };

  const getChat = (chatId: string): ChatRaw => {
    const chat = Store.Chat.get(chatId);

    return getChatModel(chat);
  };

  Object.assign(window, {
    Store: {
      ...Store,
      getChat,
      getChatModel,
      MediaCollection,
      UserConstructor,
      sendTextMsgToChat,
      base64ImageToFile
    },
    WAPI: {
      AppState: appState,
      PAIRING_STATE: STATE,
      CONNECTION_STREAM: STREAM,

      isConnected(): boolean {
        return appState.stream === "CONNECTED";
      },
      getState(): WAPI_STATE {
        const { state, stream } = appState;

        const [me] = Store.Status.models;

        const qrNode = document.querySelector("div[data-ref]");

        return {
          phone: me.id.user,
          pairingState: state,
          connectionState: stream,
          authRef: !qrNode ? null : qrNode.getAttribute("data-ref"),
          session: {
            WAToken1: localStorage.getItem("WAToken1") || "",
            WAToken2: localStorage.getItem("WAToken2") || "",
            WABrowserId: localStorage.getItem("WABrowserId") || "",
            WASecretBundle: localStorage.getItem("WASecretBundle") || ""
          }
        };
      }
    }
  });
}
