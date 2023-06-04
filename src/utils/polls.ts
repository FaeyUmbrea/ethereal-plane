import { getSetting } from './settings.js';
import { getGame } from './helpers.js';

export class Poll {
  title: string;
  options: PollOption[] = [{ text: 'yes' }, { text: 'no' }];
  tally: Array<number> = [0, 0];
  duration?: number;
  createdAt?: Date;
  status = PollStatus.notStarted;
  id: string;
}

export interface PollOption {
  text: string;
  macro?: string;
}

export enum PollStatus {
  notStarted = 0,
  started = 1,
  stopped = 2,
  failed = 3,
}

export function executePollMacro() {
  const poll = getSetting('currentPoll');
  if (poll.status === PollStatus.stopped) {
    let biggest = -1;
    let biggestIndex = -1;
    poll.tally.slice().reverse().forEach((option, index, array) => {
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