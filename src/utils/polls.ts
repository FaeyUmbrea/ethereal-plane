export class Poll {
  title: string;
  options: PollOption[] = [{ text: 'yes' }, { text: 'no' }];
  tally: Array<number> = [0, 0];
  duration?: number;
  createdAt?: Date;
  status = PollStatus.notStarted;
  id: 'none';
}

export interface PollOption {
  text: string;
  macro?: Macro;
}

export enum PollStatus {
  notStarted = 0,
  started = 1,
  stopped = 2,
  failed = 3,
}
