export class Poll {
  options = ['yes', 'no'];
  /**
   * @type {[string,number][]}
   */
  tally;
  /**
   * @type {string}
   */
  until;
  status = PollStatus.notStarted;
}

export const PollStatus = Object.freeze({
  notStarted: 0,
  started: 1,
  stopped: 2,
  failed: 3,
});
