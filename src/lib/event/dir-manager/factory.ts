import Event from "..";
import Bot from "../../bot";
import FileElementFactory from "../../util/file-element/factory";
import EventCreateInfo, { isEventCreateInfo } from "../create-info";

export default class EventFactory implements FileElementFactory<Event> {
  public readonly bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }

  public create(rawElement: EventCreateInfo, fileName: string) {
    if (isEventCreateInfo(rawElement)) {
      return new Event(fileName, this.bot, rawElement);
    }
    return null;
  }
}
