import Command from "..";
import CommandErrorType from "./type";

export default abstract class CommandError {
  private _type: CommandErrorType;
  public get type(): CommandErrorType {
    return this._type;
  }
  private _command?: Command;
  public get command(): Command {
    return this._command;
  }
  constructor(
    command?: Command,
    type: CommandErrorType = CommandErrorType.DEFAULT
  ) {
    this._type = type;
    this._command = command;
  }
  public abstract getMessage(): string;
}
