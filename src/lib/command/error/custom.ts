import CommandError from ".";
import Command from "..";
import CommandErrorType from "./type";

export default class CustomError extends CommandError {
  private message: string;
  constructor(message: string, command?: Command, type?: CommandErrorType) {
    super(command, type);
    this.message = message;
  }
  public getMessage() {
    return `Custom Error: ${this.message}`;
  }
}
