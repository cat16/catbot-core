import { Bot } from "../../..";
import FlatFileElementLoader from "../../element/loader/flat-file-element-loader";
import Event from "./event";

export class EventLoader extends FlatFileElementLoader<Event> {
  constructor(directory: string) {
    super(
      directory,
      rawElement => {
        return new rawElement();
      },
      true
    );
  }
}

export class EventManager extends ElementManager<Event> {
  public bot: Bot;

  constructor(bot: Bot) {
    super();
    this.bot = bot;
  }
}
