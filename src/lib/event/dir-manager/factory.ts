import Event from "..";
import Bot from "../../bot";
import FileElementFactory from "../../util/file-element/factory";
import EventCreateInfo from "./create-info";

export default class EventFactory implements FileElementFactory<Event> {
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }

  public create(rawElement: EventCreateInfo, fileName: string) {
    return new Event(fileName, this.bot, rawElement);
  }
}
