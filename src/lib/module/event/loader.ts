import Event from ".";
import Bot from "../../bot";
import FlatDirLoader from "../../file-element/loader/dir/flat";
import EventFactory from "./factory";

export default class EventLoader extends FlatDirLoader<Event> {
  constructor(directory: string, bot: Bot) {
    super(directory, new EventFactory(bot));
  }
}
