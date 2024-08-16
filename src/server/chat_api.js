import * as signalR from "@microsoft/signalr";

/** @type {signalR.HubConnection} */
let connection;

/**
 * @typedef {Object} chatMessage
 * @property {string} displayName
 * @property {string} messageId
 * @property {string} messageContent
 * @property {boolean} isMember
 * @property {string} channel
 * @property {string} platform
 * @property {Date} timeStamp
 */

/**
 * Initialize the SignalR connection and setup event handlers.
 * @param {string} accessToken The access token to use for authentication on the SignalR hub.
 * @param {(ChatMessage)=>void} handleChatMessageReceived The callback function to handle "ChatMessageReceived" messages.
 * @param {string} baseURL The base URL for the API
 * @returns {Promise<void>}
 */
export async function initChatAPI(
  accessToken,
  handleChatMessageReceived,
  baseURL,
) {
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

/**
 * Enable chat listeners.
 * @returns {Promise<void>}
 */
export async function enableChatListeners() {
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
