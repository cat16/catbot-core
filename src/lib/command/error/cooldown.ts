import CommandError from ".";
import CommandErrorType from "./type";

export default class CooldownError extends CommandError {
  private _secondsLeft: number;
  public get secondsLeft(): number {
    return this._secondsLeft;
  }
  constructor(secondsLeft: number) {
    super(null, CommandErrorType.COOLDOWN);
    this._secondsLeft = secondsLeft;
  }
  public getMessage() {
    return `Please wait before using another command (${
      this.secondsLeft
    } seconds left)`;
  }
}
