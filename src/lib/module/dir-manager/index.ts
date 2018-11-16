import Module from "..";
import Bot from "../../bot";
import ElementDirectoryManager from "../../file-element/manager/dir";
import ModuleLoader from "./loader";

export class ModuleManager extends ElementDirectoryManager<
  Module,
  ModuleLoader
> {
  private bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(new ModuleLoader(`${directory}/bot_modules`, bot));
    this.bot = bot;
  }
}
