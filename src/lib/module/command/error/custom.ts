import CommandError from ".";
import Command from "..";

export default class CustomError extends CommandError {
  private message: string;
  constructor(message: string, command: Command) {
    super(command);
  }
  public getMessage() {
    return this.message;
  }
}
