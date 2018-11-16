import Command from "../.";
import Bot from "../../bot";
import RecursiveElementFactory from "../../util/file-element/factory/recursive";
import RunnableCommand from "../runnable";
import RunnableCommandCreateInfo from "./runnable-create-info";

export default class CommandFactory
  implements RecursiveElementFactory<Command> {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public create(
    rawElement: RunnableCommandCreateInfo,
    fileName: string,
    parent?: Command
  ) {
    return new RunnableCommand(fileName, parent, this.bot, rawElement);
  }
  public createDir(dirName: string, parent: Command) {
    return new Command(dirName, parent, this.bot, {});
  }
}
