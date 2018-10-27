import ArgList from "./arg/list";
import RunnableCommand from "./runnable";

export default class CommandResult {
  public command: RunnableCommand;
  public args: ArgList;
  constructor(command: RunnableCommand, args: ArgList) {
    this.command = command;
    this.args = args;
  }
}
