import Command from "..";
import Bot from "../../bot";
import Module from "../../module";
import Arg from "../arg";
import { CommandPermissionContext } from "../permission-context";
import RunnableCommandCreateInfo, { CommandPermissionFunc, CommandRunFunc } from "./create-info";
import CommandRunContext from "./run-context";

export default class RunnableCommand extends Command {
  private args: Arg<any>[];
  private runFunc: CommandRunFunc;
  private hasPermFunc: CommandPermissionFunc;

  constructor(
    fileName: string,
    parent: Command,
    bot: Bot,
    module2: Module,
    createInfo: RunnableCommandCreateInfo
  ) {
    super(fileName, parent, bot, module2, createInfo);
    this.runFunc = createInfo.run;
    this.hasPermFunc = createInfo.hasPermission || (async () => true);
    this.args = createInfo.args || [];
  }

  public async run(context: CommandRunContext): Promise<void> {
    return this.runFunc(context);
  }

  public hasPermission(context: CommandPermissionContext): Promise<boolean> {
    return this.hasPermFunc.call(this, context);
  }

  public getArgs(): Arg<any>[] {
    return this.args;
  }
}
