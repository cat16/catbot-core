import CommandError from ".";
import CommandInstance from "../instance";

export default class CustomError extends CommandError {
  private message: string;
  constructor(message: string, command: CommandInstance) {
    super(command);
  }
  public getMessage() {
    return this.message;
  }
}
