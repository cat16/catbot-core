import Bot from "../../bot";
import FileElement from "../../file-element";
import EventContext from "./context";
import EventCreateInfo, { EventRunFunc } from "./manager/create-info";

export default class Event extends FileElement {
  private bot: Bot;
  private name: string;
  private runFunc: EventRunFunc;

  constructor(fileName: string, bot: Bot, createInfo: EventCreateInfo) {
    super(fileName);
    this.bot = bot;
    this.runFunc = createInfo.run;
  }

  public run(context: EventContext): void {
    this.runFunc.call({ bot: this.bot }, context);
  }

  public getBot(): Bot {
    return this.bot;
  }

  public getName() {
    return this.name;
  }
}
