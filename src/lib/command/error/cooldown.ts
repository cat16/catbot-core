import CommandError from ".";
import CommandErrorType from "./type";

export default class CooldownError extends CommandError {
  private readonly secondsLeft: number;
  constructor(secondsLeft: number) {
    super(null, CommandErrorType.PERMISSION);
    this.secondsLeft = secondsLeft;
  }
  public getMessage() {
    return `Please wait before using another command (${
      this.secondsLeft
    } seconds left)`;
  }
}
