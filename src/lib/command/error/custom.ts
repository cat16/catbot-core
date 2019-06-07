import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class CustomError extends CommandError {
  private _message: string;
  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }
  constructor(message: string, command?: Command, type?: CommandErrorType) {
    super(command, type);
    this.message = message;
  }
  public getMessage() {
    return `Custom Error: ${this.message}`;
  }
}
