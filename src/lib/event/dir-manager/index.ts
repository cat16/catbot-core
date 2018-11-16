import Event from "..";
import Bot from "../../bot";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import EventLoader from "./loader";

export default class EventDirectoryManager extends ElementDirectoryManager<
  Event,
  EventLoader
> {
  constructor(directory: string, bot: Bot) {
    super(new EventLoader(directory, bot));
  }
}
