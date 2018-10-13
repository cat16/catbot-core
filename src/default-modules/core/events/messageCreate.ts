import { Message } from "eris";
import { Bot, Event, EventType } from "../../..";

export default class extends Event {
  constructor() {
    super({
      name: "messageCreate",
      type: EventType.Client,
    });
  }
  public run(bot: Bot, msg: Message) {
    if (msg.author.id === bot.getClient().user.id) { return; }
    if (msg.author.bot /*&& !bot.get('disableBotInput', false)*/) { return; }
    bot.getCommandManager().handleMessage(msg);
  }
}
