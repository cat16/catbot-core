import Event from "../.";
import Bot from "../../../bot";
import FlatElementDirectoryLoader from "../../../file-element/loader/dir/flat";
import EventFactory from "./factory";

export default class EventLoader extends FlatElementDirectoryLoader<Event> {
  constructor(directory: string, bot: Bot) {
    super(directory, new EventFactory(bot));
  }
}
