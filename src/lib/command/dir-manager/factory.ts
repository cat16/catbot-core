import Command from "../.";
import Bot from "../../bot";
import Module from "../../module";
import RecursiveElementFactory from "../../util/file-element/factory/recursive";
import RunnableCommand from "../runnable";
import RunnableCommandCreateInfo from "../runnable-create-info";

export default class CommandFactory
  implements RecursiveElementFactory<Command> {
  public readonly bot: Bot;
  public readonly module: Module;

  constructor(bot: Bot, module2: Module) {
    this.bot = bot;
    this.module = module2;
  }

  public create(
    rawElement: RunnableCommandCreateInfo,
    fileName: string,
    parent?: Command
  ) {
    return new RunnableCommand(
      fileName,
      parent,
      this.bot,
      this.module,
      rawElement
    );
  }
  public createDir(dirName: string, parent: Command) {
    return new Command(dirName, parent, this.bot, this.module, {});
  }
}
