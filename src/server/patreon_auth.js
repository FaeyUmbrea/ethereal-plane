import * as oauth from "oauth4webapi";
import { nanoid } from "nanoid";
import { getGame } from "../utils/helpers.js";
import { MODULE_ID, PATREON_URL as issuer } from "../utils/const.js";

/** @type {number} */
let interval;

/**
 * Connects the client to the server.
 *
 * @async
 * @return {Promise<void>} - A Promise that resolves when the client is connected successfully, or rejects with an error if there was an issue connecting.
 */
export async function connectClient() {
  //https://localhost:7242/connect?url=https%3A%2F%2Fopenidconnect.net%2Fcallback&id=test&name=test

  let id = nanoid(64);

  let data = new Blob([id], { type: "text/plain" });

  if (
    !(await FilePicker.browse("data", "modules/ethereal-plane")).dirs.includes(
      "modules/ethereal-plane/storage",
    )
  ) {
    await FilePicker.createDirectory(
      "data",
      `modules/${MODULE_ID}/storage`,
      {},
    );
  }
  await FilePicker.uploadPersistent(
    MODULE_ID,
    "",
    new File([data], "client_id.txt"),
  );

  window.open(
    encodeURI(
      `${issuer}connect?url=${window.location.protocol}//${window.location.host}&id=${id}&name=${window.location.host}`,
    ),
    "_blank",
  );
  Hooks.call("ethereal-plane.patreon-connected");
}

window.connectClient = connectClient;

/**
 * Creates a client and returns its information from the discovery request and the client ID obtained from a file.
 * @returns {Promise<{as: any, client: {client_id: string, token_endpoint_auth_method: string}}>} A promise that resolves with an object containing the as (discovery response) and client information.
 * @throws {Error} If the client file is not found or the client is not initialized.
 */
async function createClient() {
  const as = await oauth
    .discoveryRequest(new URL(issuer), { algorithm: "oidc" })
    .then((response) =>
      oauth.processDiscoveryResponse(new URL(issuer), response),
    );

  let file = await foundry.utils.fetchWithTimeout(
    `${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
  );

  if (!file.ok) {
    throw new Error("Client not initialized");
  }

  const client = {
    client_id: await file.text(),
    token_endpoint_auth_method: "none",
  };
  return { as, client };
}

/**
 * Logs in the user using the OAuth device authorization flow.
 *
 * @returns {Promise<{user_code: string, verification_uri_complete: string, verification_uri: string}>} A promise that resolves with an object containing the access token and refresh token.
 * @throws {Error} If there is an OAuth 2.0 response body error.
 */
export async function patreonLogin() {
  const { as, client } = await createClient();

  /** @type {string} */
  let device_code;
  /** @type {string} */
  let verification_uri;
  /** @type {string} */
  let user_code;
  /** @type {string | undefined} */
  let verification_uri_complete;

  // Device Authorization Request & Response

  const parameters = new URLSearchParams();
  parameters.set("scope", "api offline_access");

  const response = await oauth.deviceAuthorizationRequest(
    as,
    client,
    parameters,
  );

  const result = await oauth.processDeviceAuthorizationResponse(
    as,
    client,
    response,
  );
  if (oauth.isOAuth2Error(result)) {
    console.error("Error Response", result);
    if (result.error === "invalid_client") {
      await disconnectClient();
    }
    throw new Error(); // Handle OAuth 2.0 response body error
  }

  console.log("Device Authorization Response", result);
  ({
    device_code,
    verification_uri,
    verification_uri_complete,
    user_code,
    interval = 5,
  } = result);

  // User gets shown the verification_uri and user_code, or scans a qr code formed from
  // verification_uri_complete as input.
  // User starts authenticating on his other device.
  return {
    device_code,
    verification_uri,
    verification_uri_complete,
    user_code,
  };
}

/**
 * Waits for the verification process to complete and returns the access token and refresh token.
 *
 * @returns {Promise<{access_token: string, refresh_token: string}>} A Promise that resolves to an object containing the access_token and refresh_token.
 */
export async function waitForPatreonVerification(device_code) {
  const { as, client } = await createClient();

  /** @type {string} */
  let access_token;
  /** @type {string}*/
  let refresh_token;
  let success = undefined;

  function wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, interval * 1000);
    });
  }

  while (success === undefined) {
    await wait();
    const response = await oauth.deviceCodeGrantRequest(
      as,
      client,
      device_code,
    );

    const result = await oauth.processDeviceCodeResponse(as, client, response);

    if (oauth.isOAuth2Error(result)) {
      // response is oauth style error object
      switch (result.error) {
        case "slow_down":
          interval += 5;
          continue;
        case "authorization_pending":
          continue;
        default:
          console.error("Error Response", result);
          throw new Error(); // Handle OAuth 2.0 response body error
      }
    } else {
      success = result;
    }
  }

  ({ access_token, refresh_token } = success);
  return { access_token, refresh_token };
}

/**
 * Refreshes the access token using the provided refresh token.
 *
 * @param {string} refreshtoken - The refresh token to use for token refresh.
 * @return {Promise<{access_token: string, refresh_token: string}>} - A promise that resolves to an object containing the new access token and refreshed refresh token.
 * @throws {Error} - If there is an error in the OAuth 2.0 response body.
 */
export async function refresh(refreshtoken) {
  if (refreshtoken) {
    const { as, client } = await createClient();
    const response = await oauth.refreshTokenGrantRequest(
      as,
      client,
      refreshtoken,
    );

    const result = await oauth.processRefreshTokenResponse(
      as,
      client,
      response,
    );
    if (oauth.isOAuth2Error(result)) {
      console.error("Error Response", result);
      throw new Error(); // Handle OAuth 2.0 response body error
    }
    let { access_token, refresh_token } = result;

    return { access_token, refresh_token };
  }
}

export async function disconnectClient() {
  let data = new Blob();
  await FilePicker.uploadPersistent(
    MODULE_ID,
    "",
    new File([data], "client_id.txt"),
  );
  Hooks.call("ethereal-plane.patreon-disconnected");
}
