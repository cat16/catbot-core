import Command from "..";

export default abstract class CommandError {
  private command?: Command;
  constructor(command?: Command) {
    this.command = command;
  }
  public abstract getMessage(): string;
  public getCommand(): Command {
    return this.command;
  }
}
