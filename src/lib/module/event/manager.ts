import Event, { EventConstructionData } from ".";
import Bot from "../../bot";
import ElementDirectoryGroup from "../../file-element/manager/group";
import Logger from "../../util/logger";

export class EventManager extends ElementDirectoryGroup<Event> {
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
