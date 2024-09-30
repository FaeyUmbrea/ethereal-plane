import { getSetting } from "./settings.js";
import { getGame } from "./helpers.js";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

/** */
export class Poll {
  /** @type string */
  title = undefined;
  /** @type Array<PollOption> */
  options = [
    { text: localize("ethereal-plane.ui.yes"), name: "1" },
    { text: localize("ethereal-plane.ui.no"), name: "2" },
  ];
  /** @type Array<number> @default [0, 0] */
  tally = [0, 0];
  /** @type number */
  duration = undefined;
  /** @type Date */
  createdAt = undefined;
  /** @default PollStatus.notStarted */
  status = PollStatus.notStarted;
  /** @type string */
  id = undefined;
}

export var PollStatus;
(function (PollStatus) {
  PollStatus[(PollStatus["notStarted"] = 0)] = "notStarted";
  PollStatus[(PollStatus["started"] = 1)] = "started";
  PollStatus[(PollStatus["stopped"] = 2)] = "stopped";
  PollStatus[(PollStatus["failed"] = 3)] = "failed";
})(PollStatus || (PollStatus = {}));

/** @returns {void} */
export function executePollMacro() {
  const poll = getSetting("currentPoll");
  if (poll.status === PollStatus.stopped) {
    let biggest = -1;
    let biggestIndex = -1;
    poll.tally
      .slice()
      .reverse()
      .forEach((option, index, array) => {
        if (option >= biggest) {
          biggest = option;
          biggestIndex = array.length - 1 - index;
        }
      });
    if (biggestIndex > -1) {
      const macro = poll.options[biggestIndex].macro;
      if (macro) {
        getGame().macros?.get(macro)?.execute();
      }
    }
  }
}

/** @typedef {Object} PollOption
 * @property {string} text
 * @property {string} name
 * @property {string} [macro]
 */
