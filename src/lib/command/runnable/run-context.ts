import { Message } from "discord.js";
import { MessageContainer } from "../../util/bot";
import Arg from "../arg";
import ArgList from "../arg/list";

export default class CommandRunContext extends MessageContainer {
  constructor(msg: Message, public readonly args: ArgList) {
    super(msg);
  }

  public get<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }
}
