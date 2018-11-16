import Event from "..";
import Bot from "../../../bot";
import ElementDirectoryManager from "../../../file-element/manager/dir";
import EventContext from "../context";
import EventLoader from "./loader";

export class EventManager extends ElementDirectoryManager<Event, EventLoader> {
  public bot: Bot;
  public addedEvents: string[];

  constructor(directory: string, bot: Bot) {
    super(new EventLoader(directory, bot));
    this.bot = bot;
  }

  public refreshEvents() {
    this.getElements().forEach(event => {
      if (!this.addedEvents.find(e => e === event.getName())) {
        this.bot.getClient().on(event.getName(), (...data: any[]) => {
          this.runEvent(event.getName(), data);
        });
      }
    });
  }

  public runEvent(name: string, data: any[]) {
    this.getElements().forEach(event => {
      if (event.getName() === name) {
        event.run(new EventContext(data));
      }
    });
  }
}
