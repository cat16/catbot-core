import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class UnknownCommand extends CommandError {
  private content: string;
  constructor(content: string, command?: Command) {
    super(command, CommandErrorType.INVALID_INFORMATION);
    this.content = content;
  }
  public getMessage() {
    const subcommand = this.command;
    return subcommand
      ? `Unknown subcommand was provided for command '${subcommand}': '${
          this.content
        }'`
      : `Unkown command '${this.content}'`;
  }
}
