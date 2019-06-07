export default class ArgFailure {
  private _conditionsFailed: string[];

  constructor(conditionsFailed: string[]) {
    this._conditionsFailed = conditionsFailed;
  }

  get conditionsFailed(): string[] {
    return this._conditionsFailed;
  }
}
