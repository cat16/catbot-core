import Command from "..";
import CommandErrorType from "./type";

export default abstract class CommandError {
  public readonly type: CommandErrorType;
  public readonly command?: Command;
  constructor(
    command?: Command,
    type: CommandErrorType = CommandErrorType.DEFAULT
  ) {
    this.type = type;
    this.command = command;
  }
  public abstract getMessage(): string;
}
