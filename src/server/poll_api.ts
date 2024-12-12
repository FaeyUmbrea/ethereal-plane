import { HubConnection } from "@microsoft/signalr";

let connection: HubConnection;

export interface PollData {
  id: string;
  title: string;
  chatPollPrefix: string;
  endTimeStamp: Date;
  startTimeStamp: Date;
  aborted: boolean;
  finalized: boolean;
  options: Array<{ count: number; name: string }>;
}

export interface PollCreateOption {
  name: string;
  title: string;
}

export async function initPollAPI(
  bearerToken: string,
  pollUpdateCallback: (data: PollData) => void,
  baseUrl: string,
): Promise<void> {
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

export function getPoll(pollId: string): Promise<void> {
  if (connection) {
    return connection.invoke("GetPoll", pollId);
  }
  return Promise.resolve();
}

export function createPoll(
  duration: number,
  options: Array<PollCreateOption>,
  prefix: string,
  title: string,
): Promise<string> {
  if (connection) {
    return connection.invoke("CreatePoll", duration, options, prefix, title);
  } else {
    throw new Error("Connection not initialized");
  }
}

export function abortPoll(pollId: string): Promise<void> {
  if (connection) {
    return connection.invoke("AbortPoll", pollId);
  }
  return Promise.resolve();
}

export function endPoll(pollId: string) {
  if (connection) {
    return connection.invoke("AbortPoll", pollId);
  }
}
export async function disconnectPollAPI() {
  if (connection) {
    await connection.stop();
  }
}
