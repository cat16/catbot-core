import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";
export default class NoArgumentProvided extends CommandError {
  private arg: string;
  constructor(arg: string, command: Command) {
    super(command, CommandErrorType.MISSING_INFORMATION);
    this.arg = arg;
  }
  public getMessage() {
    return `Nothing was provided for argument '${
      this.arg
    }' of command '${this.command.getFullName()}'`;
  }
}
