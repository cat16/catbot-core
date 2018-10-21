import Bot from "../../bot";
import { loadDirFlat } from "../../file-element/manager/load";
import ElementDirectoryManager from "../../file-element/manager/manager";
import Logger from "../../util/logger";
import BotEvent, { EventConstructionData } from "./event";

export class EventManager extends ElementDirectoryManager<BotEvent> {
  public bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(
      directory,
      (dir: string) =>
        loadDirFlat(dir, EventClass => {
          const data: EventConstructionData = {
            fileName: dir, // wait what am I doing right here
            bot: this.bot
          };
          return new EventClass(data);
        }),
      new Logger("Module Manager", bot.getLogger())
    );
    this.bot = bot;
  }
}
