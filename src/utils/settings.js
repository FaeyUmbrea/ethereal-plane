import {Poll} from "./polls.js";

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
    registerSetting("currentPoll", {
        type: Object,
        scope: 'world',
        config: false,
        default: new Poll()
    })
    registerSetting("enableChatTab", {
        type: Boolean,
        scope: 'world',
        config: true,
        default: true
    })
}

/**
 *
 * @param {string} settingName
 * @param { Record<string, unknown>} config
 */
function registerSetting(settingName, config){
    game.settings.register(moduleID, settingName, {
        name: `${moduleID}.settings.${settingName}.Name`,
        hint: `${moduleID}.settings.${settingName}.Hint`,
        ...config,
    });
}

/**
 *
 * @param {string} settingName
 * @returns {unknown}
 */
export function getSetting(settingName) {
    return game.settings.get(moduleID, settingName);
}

/**
 *
 * @param {string} settingName
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setSetting(settingName, value) {
    await game.settings.set(moduleID, settingName, value);
}
