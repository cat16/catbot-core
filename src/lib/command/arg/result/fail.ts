export default class ArgFailure {
  public readonly conditionsFailed: string[];

  constructor(reasons: string[]) {
    this.conditionsFailed = reasons;
  }
}
