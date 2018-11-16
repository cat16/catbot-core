import CommandError from ".";
import Command from "..";

export default class UnknownCommand extends CommandError {
  private content: string;
  constructor(content: string, command?: Command) {
    super(command);
    this.content = content;
  }
  public getMessage() {
    const subcommand = this.getCommand();
    return subcommand
      ? `Unknown subcommand was provided for command '${subcommand.getFullName()}': '${
          this.content
        }'`
      : `Unkown command '${this.content}'`;
  }
}
