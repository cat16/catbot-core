import CommandError from ".";

export default class NoCommandProvided extends CommandError {
  public getMessage() {
    const command = this.getCommand();
    return command
      ? `No subcommand was provided for command '${command.getFullName()}'`
      : `No command was provided`;
  }
}
