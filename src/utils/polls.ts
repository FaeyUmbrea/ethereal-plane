import { localize } from '#runtime/util/i18n';
import { getGame } from './helpers.js';
import { getSetting } from './settings.js';

export enum PollStatus {
	notStarted = 0,
	started = 1,
	stopped = 2,
	failed = 3,
}

export class Poll {
	title: string = 'Poll';
	options: PollOption[] = [
		{ text: localize('ethereal-plane.ui.yes'), name: '1' },
		{ text: localize('ethereal-plane.ui.no'), name: '2' },
	];

	tally: number[] = [0, 0];
	duration: number = 30;
	createdAt: Date = new Date();
	status: PollStatus = PollStatus.notStarted;
	id: string = 'awawawawawa';
}

export function executePollMacro(): void {
	const poll = getSetting('currentPoll') as Poll;
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

export interface PollOption {
	text: string;
	name: string;
	macro?: string;
}
