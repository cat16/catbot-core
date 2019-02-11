import { Message, MessageContent } from "eris";
import Bot from "../bot";
import Arg from "./arg";
import ArgList from "./arg/list";

export default class CommandRunContext {
  public msg: Message;
  public args: ArgList;

  constructor(msg, args: ArgList) {
    this.msg = msg;
    this.args = args;
  }

  public getArg<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }

  public say(msg: MessageContent): Promise<Message> {
    return this.msg.channel.createMessage(msg);
  }
}
