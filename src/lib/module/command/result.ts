import { Command } from "eris";

import { ArgList } from ".";

export default class CommandResult {
  public command: Command;
  public args: ArgList;
  constructor(command: Command, args: ArgList) {
    this.command = command;
    this.args = args;
  }
}
