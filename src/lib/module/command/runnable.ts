import Command, { CommandConstructionData, CommandOptions } from ".";
import Arg from "./arg";
import CommandContext from "./context";

export interface RunnableCommandOptions extends CommandOptions {
  args?: Arg[];
}

export default abstract class RunnableCommand extends Command {
  private args: Arg[];

  constructor(data: CommandConstructionData, options: RunnableCommandOptions) {
    super(data, options);
  }
  public abstract run(data: CommandContext): void;

  public getArgs(): Arg[] {
    return this.args;
  }
}
