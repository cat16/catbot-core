import CommandError from ".";
import Command from "..";
import Arg from "../arg";
import ArgFailure from "../arg/result/fail";
export default class InvalidArgumentProvided extends CommandError {
  private arg: Arg<any>;
  private failures: ArgFailure[];
  constructor(arg: Arg<any>, failures: ArgFailure[], command: Command) {
    super(command);
    this.arg = arg;
    this.failures = failures;
  }
  public getMessage() {
    return `Invalid input was provided for argument '${
      this.arg.name
    }' of command '${this.getCommand().getFullName()}': The following conditions were not met:\n - ${[
      ...this.failures.map(f => f.conditionsFailed)
    ].join("\n - ")}`;
  }
}
