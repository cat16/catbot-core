import Bot from "../../bot";
import FileElement from "../../element/file-element";

export enum EventType {
  Client
}

export interface EventOptions {
  type: EventType;
}

export default abstract class Event extends FileElement {
  public type: EventType;

  constructor(options: EventOptions) {
    super(path);
    this.type = options.type;
  }

  public abstract run(bot: Bot, ...args): void;

  public getTriggers(): string[] {
    return [name];
  }
}
