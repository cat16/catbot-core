import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class InvalidChannelType extends CommandError {
  constructor(command: Command) {
    super(command, CommandErrorType.INVALID_INFORMATION);
  }
  public getMessage() {
    return `This command cannot be used in this channel; possible channel types are:${this.command.channelTypes
      .getValue()
      .map(t => `\n - ${t.name}`)
      .join("")}`;
  }
}
