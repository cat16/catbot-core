import Bot from "../../bot";
import FileElement from "../../element/file-element";

export enum EventType {
  Client
}

export interface EventConstructionData {
  fileName: string;
  bot: Bot;
}

export interface EventOptions {
  type: EventType;
}

export default abstract class BotEvent extends FileElement {
  private type: EventType;
  private bot: Bot;

  constructor(data: EventConstructionData, options: EventOptions) {
    super(data.fileName);
    this.type = options.type;
  }

  public abstract run(bot: Bot, ...args): void;

  public getTriggers(): string[] {
    return [name];
  }

  public getType(): EventType {
    return this.type;
  }

  public getBot(): Bot {
    return this.bot;
  }
}
