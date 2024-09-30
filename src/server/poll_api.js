/**
 * @type {import('@microsoft/signalr').HubConnection}
 */
let connection = null;

/**
 * @typedef {Object} PollData
 * @property {string} id - Unique Id
 * @property {string} title - Title of the Poll
 * @property {string} chatPollPrefix - Prefix for Chat Poll
 * @property {Date} endTimeStamp - End Time Stamp
 * @property {Date} startTimeStamp - Start Time Stamp
 * @property {boolean} aborted - Is Poll Aborted
 * @property {boolean} finalized - Is Poll Finalized
 * @property {Array<{count:int,name:string}>} options - List of Poll Options
 */

/**
 * Initializes a connection to the pollHub using SignalR library.
 * @param {(data: PollData) => void} pollUpdateCallback - The callback function to be called when a PollUpdate event is received.
 * @param {string} bearerToken - The bearer token used for authentication.
 * @param {string} baseUrl - The base URL of the server.
 * @return {Promise} - A Promise representing the connection start operation.
 */
export async function initPollAPI(bearerToken, pollUpdateCallback, baseUrl) {
  const signalR = await import("@microsoft/signalr");
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}api/v2/hubs/polls`, {
      accessTokenFactory: () => bearerToken,
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("PollUpdate", pollUpdateCallback);

  await connection.start();
}

/**
 * Retrieves a poll from the server.
 *
 * @param {string} pollId - The ID of the poll to retrieve.
 * @return {Promise} - A promise that resolves with the poll data.
 */
export function getPoll(pollId) {
  if (connection) {
    return connection.invoke("GetPoll", pollId);
  }
}

/**
 * Creates a poll with the given duration, options, prefix, and title.
 *
 * @param {number} duration - The duration of the poll in milliseconds.
 * @param {array} options - The options for the poll.
 * @param {string} prefix - The prefix for the poll.
 * @param {string} title - The title of the poll.
 *
 * @return {Promise} - A Promise that resolves with the result of invoking "CreatePoll" method on the connection, or rejects with an error if the connection is not available.
 */
export function createPoll(duration, options, prefix, title) {
  if (connection) {
    return connection.invoke("CreatePoll", duration, options, prefix, title);
  }
}

/**
 * Aborts a poll.
 *
 * @param {string} pollId - The ID of the poll to be aborted.
 *
 * @return {Promise} The promise that will be resolved when the poll is successfully aborted.
 */
export function abortPoll(pollId) {
  if (connection) {
    return connection.invoke("AbortPoll", pollId);
  }
}

/**
 * Ends the specified poll.
 *
 * @param {string} pollId - The identifier of the poll to be ended.
 * @return {Promise} A promise that will be resolved when the poll is successfully ended.
 */
export function endPoll(pollId) {
  if (connection) {
    return connection.invoke("AbortPoll", pollId);
  }
}

/**
 * Delete a poll with the specified ID.
 *
 * @param {number} pollId - The ID of the poll to be deleted.
 * @return {Promise} - A promise that resolves when the poll is successfully deleted.
 */
export function deletePoll(pollId) {
  if (connection) {
    return connection.invoke("DeletePoll", pollId);
  }
}

export async function disconnectPollAPI() {
  if (connection) {
    await connection.stop();
  }
}
