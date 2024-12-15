/* eslint-disable no-console */

export function log(...args: any[]) {
	console.log(`Ethereal Plane | `, ...args);
}

export function warn(...args: any[]) {
	console.warn(`Ethereal Plane | `, ...args);
}

export function error(...args: any[]) {
	console.error(`Ethereal Plane | `, ...args);
}

export function debug(...args: any[]) {
	console.debug(`Ethereal Plane | `, ...args);
}

export async function readTextFromFile(file: File): Promise<string> {
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.onload = (_) => {
			resolve(reader.result as string);
		};
		reader.onerror = (ev) => {
			reader.abort();
			reject(ev);
		};
		reader.readAsText(file);
	});
}
