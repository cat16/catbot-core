import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class CrashedError extends CommandError {
  private _error: Error;
  public get error(): Error {
    return this._error;
  }

  constructor(command: Command, error: Error) {
    super(command, CommandErrorType.ERROR);
    this._error = error;
  }

  public getMessage() {
    return `Command ${this.command} crashed: ${this.error.stack}`;
  }
}
