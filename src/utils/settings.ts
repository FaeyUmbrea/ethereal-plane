import { getGame } from "./helpers";

const moduleID = "ethereal-plane"

export function registerSettings() {
    registerSetting("server-url", {
        default: "http://localhost:3000",
        type: String,
        scope: 'client',
        config: true
    })
    registerSetting("enabled", {
        default: false,
        type: Boolean,
        scope: 'client',
        config: true
    })
    registerSetting("sendRollsToChat", {
        default: true,
        type: Boolean,
        scope: 'world',
        config: true
    })
}

function registerSetting(settingName: string, config: Record<string, unknown>): void {
    getGame().settings.register(moduleID, settingName, {
        name: `${moduleID}.settings.${settingName}.Name`,
        hint: `${moduleID}.settings.${settingName}.Hint`,
        ...config,
    });
}

export function getSetting(settingName: string): any {
    return getGame().settings.get('obs-utils', settingName);
}

export async function setSetting(settingName: string, value: any) {
    await getGame().settings.set('obs-utils', settingName, value);
}
