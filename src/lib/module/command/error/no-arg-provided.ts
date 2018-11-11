import CommandError from ".";
import Command from "..";
export default class NoArgumentProvided extends CommandError {
  private arg: string;
  constructor(arg: string, command: Command) {
    super(command);
    this.arg = arg;
  }
  public getMessage() {
    return `Nothing was provided for argument'${
      this.arg
    }' of command '${this.getCommand().getFullName()}'`;
  }
}
