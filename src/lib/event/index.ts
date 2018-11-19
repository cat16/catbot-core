import Bot from "../bot";
import FileElement from "../util/file-element";
import EventContext from "./context";
import EventCreateInfo, { EventRunFunc } from "./create-info";

export default class Event extends FileElement {
  public readonly bot: Bot;
  public readonly name: string;
  private runFunc: EventRunFunc;

  constructor(fileName: string, bot: Bot, createInfo: EventCreateInfo) {
    super(fileName);
    this.bot = bot;
    this.name = fileName;
    this.runFunc = createInfo.run;
  }

  public run(context: EventContext): void {
    this.runFunc.call(this, context);
  }
}
