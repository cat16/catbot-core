import { Bot, ModuleConstructionData } from "../..";
import ElementDirectoryManager from "../file-element/manager";
import { generateClassInit, loadDirFlat } from "../file-element/manager/load";
import Logger from "../util/logger";
import BotModule from "./module";

export class ModuleManager extends ElementDirectoryManager<BotModule> {
  private bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(
      directory,
      (dir: string) =>
        loadDirFlat(dir, generateClassInit(bot), { targetFile: "module" }),
      new Logger("Module Manager", bot.getLogger())
    );
    this.bot = bot;
  }
}
