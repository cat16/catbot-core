import Event from ".";
import Bot from "../bot";
import { reportErrors } from "../util";
import Logger from "../util/logger";
import EventContext from "./context";

export default class EventManager {
  public readonly bot: Bot;
  public readonly logger: Logger;
  private addedEvents: string[];

  constructor(bot: Bot) {
    this.bot = bot;
    this.logger = new Logger("event-manager", bot.logger);
    this.addedEvents = [];
  }

  public load() {
    this.bot.moduleManager
      .getElements()
      .forEach(m =>
        reportErrors(this.logger, "event", m.eventDirManager.loadAll())
      );
    this.updateEvents();
    this.logger.success(
      `Successfully loaded ${this.getElements().length} events.`
    );
  }

  public getElements(): Event[] {
    return [].concat(
      ...this.bot.moduleManager
        .getElements()
        .map(m => m.eventDirManager.getElements())
    );
  }

  private updateEvents() {
    this.getElements().forEach(event => {
      if (this.addedEvents.find(e => e === event.name) == null) {
        this.bot.getClient().on(event.name, (...data: any[]) => {
          this.runEvent(event.name, data);
        });
      }
    });
  }

  private runEvent(name: string, data: any[]) {
    this.getElements().forEach(event => {
      if (event.name === name) {
        event.run(new EventContext(data));
      }
    });
  }
}
