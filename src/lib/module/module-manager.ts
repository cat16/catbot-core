import { Bot, ModuleConstructionData } from "../..";
import ElementDirectoryManager from "../element/manager/element-directory-manager";
import { loadDirFlat } from "../element/manager/load";
import Logger from "../util/logger";
import BotModule from "./module";

export class ModuleManager extends ElementDirectoryManager<BotModule> {
  public bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(
      directory,
      (dir: string) =>
        loadDirFlat(
          dir,
          ModuleClass => {
            let data: ModuleConstructionData = {
              directory: dir,
              bot: this.bot
            };
            return new ModuleClass(data);
          },
          { targetFile: "module" }
        ),
      new Logger("Module Manager", bot.getLogger())
    );
    this.bot = bot;
  }
}
