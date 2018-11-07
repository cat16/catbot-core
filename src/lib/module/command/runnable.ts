import Arg from "./arg";
import CommandContext from "./context";
import CommandInstance, {
  CommandConstructionData,
  CommandOptions
} from "./instance";

export interface RunnableCommandOptions extends CommandOptions {
  args?: Arg[];
}

export default abstract class RunnableCommand extends CommandInstance {
  private args: Arg[];

  constructor(data: CommandConstructionData, options: RunnableCommandOptions) {
    super(data, options);
  }
  public abstract run(data: CommandContext): void;

  public getArgs(): Arg[] {
    return this.args;
  }
}
