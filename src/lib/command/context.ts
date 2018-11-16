import { Message, MessageContent } from "eris";
import Bot from "../bot";
import ArgList from "./arg/list";

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
