import Event from "..";
import Bot from "../../bot";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import EventContext from "../context";
import EventLoader from "./loader";

export class EventManager extends ElementDirectoryManager<Event, EventLoader> {
  public readonly bot: Bot;
  private addedEvents: string[];

  constructor(directory: string, bot: Bot) {
    super(new EventLoader(directory, bot));
    this.bot = bot;
  }

  public refreshEvents() {
    this.getElements().forEach(event => {
      if (!this.addedEvents.find(e => e === event.name)) {
        this.bot.client.on(event.name, (...data: any[]) => {
          this.runEvent(event.name, data);
        });
      }
    });
  }

  public runEvent(name: string, data: any[]) {
    this.getElements().forEach(event => {
      if (event.name === name) {
        event.run(new EventContext(data));
      }
    });
  }
}
