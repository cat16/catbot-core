import { Message, MessageContent } from "eris";
import { ArgList } from ".";
import { Bot } from "../../..";

export default class CommandContext {
  public bot: Bot;
  public msg: Message;
  public args: ArgList;

  constructor(bot, msg, args: ArgList) {
    this.bot = bot;
    this.msg = msg;
    this.args = args;
  }

  public say(msg: MessageContent): Promise<Message> {
    return this.msg.channel.createMessage(msg);
  }
}
