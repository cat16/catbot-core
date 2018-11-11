import Event from ".";
import FileElementFactory from "../../file-element/factory";

export default class EventFactory implements FileElementFactory<Event> {
  constructor() {}

  public create(rawElement: any, fileName: string) {
    return new Event();
  }
}
