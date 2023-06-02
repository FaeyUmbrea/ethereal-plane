export class Poll {
  title: string;
  options: PollOption[] = [{ text: 'yes' }, { text: 'no' }];
  tally: Map<PollOption, number>;
  duration?: number;
  createdAt?: Date;
  status = PollStatus.notStarted;
  id: 'none';
  until = () => {
    return this.createdAt ? this.duration ? this.createdAt.getTime() + this.duration : undefined : undefined;
  };
}

export interface PollOption {
  text: string,
  macro?: Macro
}

export enum PollStatus {
  notStarted = 0,
  started = 1,
  stopped = 2,
  failed = 3,
}
