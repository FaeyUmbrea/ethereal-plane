export class Poll {
    options: string[] = ["yes","no"];
    tally?: [string,number][];
    until?: string;
    status: PollStatus = PollStatus.notStarted;
}

export enum PollStatus {
    notStarted = 0,
    started = 1,
    stopped = 2,
    failed = 3
}