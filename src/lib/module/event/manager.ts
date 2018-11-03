import BotEvent, { EventConstructionData } from ".";
import Bot from "../../bot";
import ElementDirectoryManager from "../../file-element/manager";
import { loadDirFlat } from "../../file-element/manager/load";
import Logger from "../../util/logger";

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
