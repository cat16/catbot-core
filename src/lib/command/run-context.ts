import { Message, MessageOptions, StringResolvable } from "discord.js";
import { formatResponse } from "../util/bot";
import Arg from "./arg";
import ArgList from "./arg/list";

export default class CommandRunContext {
  public msg: Message;
  public args: ArgList;

  constructor(msg: Message, args: ArgList) {
    this.msg = msg;
    this.args = args;
  }

  public reply(
    content?: StringResolvable,
    options?: MessageOptions
  ): Promise<Message | Message[]>;
  public reply(options?: MessageOptions): Promise<Message | Message[]>;
  public reply(
    content?: any,
    options?: MessageOptions
  ): Promise<Message | Message[]> {
    return this.msg.channel.send(content, options);
  }

  public info(message: string);
  public info(topic: string, message: string);
  public info(topic: string, message?: string) {
    const description = message || topic;
    this.reply(
      formatResponse({
        color: 0xaaaaff,
        description,
        header: message
          ? { title: topic, symbol: ":information_source:" }
          : undefined,
        trigger: this.msg
      })
    );
  }

  public success(message: string) {
    this.reply(
      formatResponse({
        color: 0x00ff00,
        description: message,
        header: { title: "Success", symbol: ":white_check_mark:" },
        trigger: this.msg
      })
    );
  }

  public error(message: string) {
    this.reply(
      formatResponse({
        color: 0xff0000,
        description: message,
        header: { title: "An error has occurred", symbol: ":exclamation:" },
        trigger: this.msg
      })
    );
  }

  public invalid(message: string) {
    this.reply(
      formatResponse({
        color: 0xffff00,
        description: message,
        header: { title: "Invalid input", symbol: ":x:" },
        trigger: this.msg
      })
    );
  }

  public getArg<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }
}
