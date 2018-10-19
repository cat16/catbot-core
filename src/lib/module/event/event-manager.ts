import BotEvent, { EventConstructionData } from "./event";
import ElementDirectoryManager from "../../element/manager/element-directory-manager";
import Bot from "../../bot";
import Logger from "../../util/logger";
import { loadDirFlat } from "../../element/manager/load";

export class EventManager extends ElementDirectoryManager<BotEvent> {
  public bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(
      directory,
      (dir: string) =>
        loadDirFlat(dir, EventClass => {
          let data: EventConstructionData = {
            fileName: dir, //wait what am I doing right here
            bot: this.bot
          };
          return new EventClass(data);
        }),
      new Logger("Module Manager", bot.getLogger())
    );
    this.bot = bot;
  }
}
