import { CommandOrGroup } from "../instance";

export default abstract class CommandError {
  private command?: CommandOrGroup;
  constructor(command?: CommandOrGroup) {
    this.command = command;
  }
  public abstract getMessage(): string;
  public getCommand(): CommandOrGroup {
    return this.command;
  }
}
