import type {
	DeviceAuthorizationResponse,
	TokenEndpointResponse,
} from 'oauth4webapi';
import { nanoid } from 'nanoid';
import * as oauth from 'oauth4webapi';
import { PATREON_URL as issuer, MODULE_ID } from '../utils/const.js';
import { error, log } from '../utils/utils';

let interval: number;

export async function connectClient(): Promise<void> {
	const id = nanoid(64);

	const data = new Blob([id], { type: 'text/plain' });

	if (
		(!((await FilePicker.browse('data', 'modules/ethereal-plane')) as any).dirs.includes(
			'modules/ethereal-plane/storage',
		))
	) {
		await FilePicker.createDirectory(
			'data',
			`modules/${MODULE_ID}/storage`,
			{},
		);
	}
	await FilePicker.uploadPersistent(
		MODULE_ID,
		'',
		new File([data], 'client_id.txt'),
	);

	window.open(
		encodeURI(
			`${issuer}connect?url=${window.location.protocol}//${window.location.host}&id=${id}&name=${window.location.host}`,
		),
		'_blank',
	);
	Hooks.call('ethereal-plane.patreon-connected');
}

async function createClient() {
	const as = await oauth
		.discoveryRequest(new URL(issuer), { algorithm: 'oidc' })
		.then(response =>
			oauth.processDiscoveryResponse(new URL(issuer), response),
		);

	const file = await foundry.utils.fetchWithTimeout(
		`${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
	);

	if (!file.ok) {
		throw new Error('Client not initialized');
	}

	const client = {
		client_id: await file.text(),
	};
	return { as, client };
}

export async function patreonLogin() {
	const { as, client } = await createClient();

	let device_code: string;
	let verification_uri: string;
	let user_code: string;
	let verification_uri_complete: string | undefined;

	// Device Authorization Request & Response

	const parameters = new URLSearchParams();
	parameters.set('scope', 'api offline_access');

	const clientAuth = oauth.None();
	const response = await oauth.deviceAuthorizationRequest(
		as,
		client,
		clientAuth,
		parameters,
	);

	try {
		const result: DeviceAuthorizationResponse | void
      = await oauth.processDeviceAuthorizationResponse(as, client, response);
		log('Device Authorization Response', result);
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
	} catch (err) {
		if (err instanceof oauth.ResponseBodyError) {
			console.error('Error Response', err);
			if (err.error === 'invalid_client') {
				await disconnectClient();
			}
		}
		return Promise.reject(err);
	}
}

export async function waitForPatreonVerification(device_code: string) {
	const { as, client } = await createClient();

	let success: TokenEndpointResponse | undefined;

	function wait() {
		return new Promise((resolve) => {
			setTimeout(resolve, interval * 1000);
		});
	}

	while (success === undefined) {
		await wait();
		const clientAuth = oauth.None();

		const response = await oauth.deviceCodeGrantRequest(
			as,
			client,
			clientAuth,
			device_code,
		);

		try {
			success = await oauth.processDeviceCodeResponse(as, client, response);
		} catch (err) {
			if (err instanceof oauth.ResponseBodyError) {
				switch (err.error) {
					case 'slow_down':
						interval += 5;
						continue;
					case 'authorization_pending':
						continue;
					default:
						error('Error Response', success);
						throw new Error('Oauth Response error'); // Handle OAuth 2.0 response body error
				}
			}
		}
	}
	return {
		access_token: success.access_token,
		refresh_token: success.refresh_token,
	};
}

export async function refresh(refreshToken: string) {
	if (refreshToken) {
		const { as, client } = await createClient();

		const clientAuth = oauth.None();
		const response = await oauth.refreshTokenGrantRequest(
			as,
			client,
			clientAuth,
			refreshToken,
		);

		try {
			const result = await oauth.processRefreshTokenResponse(
				as,
				client,
				response,
			);

			const { access_token, refresh_token } = result;
			return { access_token, refresh_token };
		} catch (err) {
			if (err instanceof oauth.ResponseBodyError) {
				console.error('Error Response', err);
			}
			return Promise.reject(err);
		}
	}
	return Promise.reject(new Error('Refresh Token is not set'));
}

export async function disconnectClient() {
	const data = new Blob();
	await FilePicker.uploadPersistent(
		MODULE_ID,
		'',
		new File([data], 'client_id.txt'),
	);
	Hooks.call('ethereal-plane.patreon-disconnected');
}
