import Event from "../.";
import Bot from "../../bot";
import FlatElementDirectoryLoader from "../../util/file-element/loader/default/flat";
import EventFactory from "./factory";

export default class EventLoader extends FlatElementDirectoryLoader<Event> {
  constructor(directory: string, bot: Bot) {
    super(directory, new EventFactory(bot));
  }
}
