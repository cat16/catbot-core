import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class NoCommandProvided extends CommandError {
  constructor(subcommand?: Command) {
    super(subcommand, CommandErrorType.MISSING_INFORMATION);
  }
  public getMessage() {
    const subcommand = this.command;
    return subcommand
      ? `No subcommand was provided for command '${subcommand.getFullName()}'`
      : `No command was provided`;
  }
}
