import { CommandOrGroup } from ".";

export default class CommandError {
  public message: string;
  public command?: CommandOrGroup;
  constructor(message: string, command?: CommandOrGroup) {
    this.message = message;
    this.command = command;
  }
}
