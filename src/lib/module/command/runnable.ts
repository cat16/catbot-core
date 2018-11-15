import Command from ".";
import Bot from "../../bot";
import Arg from "./arg";
import CommandContext from "./context";
import RunnableCommandCreateInfo, {
  CommandRunFunc
} from "./manager/runnable-create-info";

export default class RunnableCommand extends Command {
  private args: Arg[];
  private runFunc: CommandRunFunc;

  constructor(
    fileName: string,
    parent: Command,
    bot: Bot,
    createInfo: RunnableCommandCreateInfo
  ) {
    super(fileName, parent, bot, createInfo);
    this.runFunc = createInfo.run;
  }
  public run(context: CommandContext) {
    this.runFunc(context);
  }

  public getArgs(): Arg[] {
    return this.args;
  }
}
