import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class PermissionError extends CommandError {
  constructor(command: Command) {
    super(command, CommandErrorType.PERMISSION);
  }
  public getMessage() {
    return `You do not have permission to use this command`;
  }
}
