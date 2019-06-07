import Command from "..";
import Bot from "../../bot";
import Module from "../../module";
import Arg from "../arg";
import RunnableCommandCreateInfo, { CommandRunFunc } from "./create-info";
import CommandRunContext from "./run-context";

export default class RunnableCommand extends Command {
  private _args: Arg<any>[];
  private runFunc: CommandRunFunc;

  constructor(
    fileName: string,
    parent: Command,
    bot: Bot,
    module2: Module,
    createInfo: RunnableCommandCreateInfo
  ) {
    super(fileName, parent, bot, module2, createInfo);
    this.runFunc = createInfo.run;
    this._args = createInfo.args || [];
  }

  public async run(context: CommandRunContext): Promise<void> {
    return this.runFunc(context);
  }

  get args(): Arg<any>[] {
    return this._args;
  }
}
