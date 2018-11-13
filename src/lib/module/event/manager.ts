import Event from ".";
import Bot from "../../bot";
import ElementDirectoryGroup from "../../file-element/manager/group";
import EventContext from "./context";
import EventLoader from "./loader";

export class EventManager extends ElementDirectoryGroup<Event> {
  public bot: Bot;
  public addedEvents: string[];

  constructor(directories: string[], bot: Bot) {
    super(directories.map(dir => new EventLoader(dir, bot)));
    this.bot = bot;
  }

  public refreshEvents() {
    this.getAll().forEach(event => {
      if (!this.addedEvents.find(e => e === event.getName())) {
        this.bot.getClient().on(event.getName(), (...data: any[]) => {
          this.runEvent(event.getName(), data);
        });
      }
    });
  }

  public runEvent(name: string, data: any[]) {
    this.getAll().forEach(event => {
      if (event.getName() === name) {
        event.run(new EventContext(data));
      }
    });
  }
}
