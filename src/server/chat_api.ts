import { HubConnection } from "@microsoft/signalr";

let connection: HubConnection;

export interface ChatMessage {
  displayName: string;
  messageId: string;
  messageContent: string;
  isMember: boolean;
  channel: string;
  platform: string;
  timeStamp: Date;
}

export async function initChatAPI(
  accessToken: string,
  handleChatMessageReceived: (chatMessage: ChatMessage) => void,
  baseURL: string,
): Promise<void> {
  const signalR = await import("@microsoft/signalr");
  connection = new signalR.HubConnectionBuilder()
    .withUrl(baseURL + "api/v2/hubs/chat", {
      accessTokenFactory: () => accessToken,
      withCredentials: false,
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ChatMessageReceived", handleChatMessageReceived);
  connection.onclose(() => {
    console.log("disconnected");
  });

  await connection.start();
}

/**
 * Send a chat message.
 * @param {string} message The message to send.
 * @returns {Promise<void>}
 */
export async function sendChatMessage(message) {
  if (connection === undefined) {
    return;
  }
  return connection
    .invoke("SendMessage", message)
    .catch((err) => console.error(err));
}

export async function enableChatListeners(): Promise<void> {
  if (connection === undefined) {
    return;
  }
  return connection
    .invoke("EnableChatListeners")
    .catch((err) => console.error(err));
}

export async function disableChatListeners() {
  if (connection === undefined) {
    return;
  }
  return connection
    .invoke("DisableChatListeners")
    .catch((err) => console.error(err));
}

export async function setYoutubeId(id) {
  if (connection === undefined) {
    return;
  }
  connection.invoke("SetYoutubeId", id).catch((err) => console.error(err));
}

export async function disconnectChatAPI() {
  if (connection) {
    await connection.stop();
  }
}
