import CommandError from "..";
import Command from "../..";
import CommandErrorType from "../type";

export default class IgnoredError extends CommandError {
  private _reason: string;
  public get reason(): string {
    return this._reason;
  }

  constructor(reason: string, command?: Command) {
    super(command, CommandErrorType.DEFAULT);
    this._reason = reason;
  }

  public getMessage() {
    return `Command ${this.command ? `${this.command} ` : ""}ignored: ${
      this.reason
    }`;
  }
}
