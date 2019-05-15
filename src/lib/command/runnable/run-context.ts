import { Message, MessageOptions, StringResolvable } from "discord.js";
import { formatResponse } from "../../util/bot";
import Arg from "../arg";
import ArgList from "../arg/list";

export default class CommandRunContext {
  public readonly msg: Message;
  public readonly args: ArgList;

  constructor(msg: Message, args: ArgList) {
    this.msg = msg;
    this.args = args;
  }

  // TODO: these won't work if the message is too long xd (unless djs has a way to handle it)

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

  public info(message: string, topic?: string) {
    const description = message;
    return this.reply(
      formatResponse({
        color: 0xaaaaff,
        description,
        header: topic
          ? { title: topic, symbol: ":information_source:" }
          : undefined,
        trigger: this.msg
      })
    );
  }

  public list(name: string, arr: {name: string, description: string}[], symbol: string = ":information_source:") {
    const embed = formatResponse({
      color: 0xaaaaff,
      description: "",
      header: {
        symbol, title: name
      },
      trigger: this.msg
    })
    for(const element of arr) {
      embed.addField(element.name, element.description);
    }
    return this.reply(embed);
  }

  public success(message: string) {
    return this.reply(
      formatResponse({
        color: 0x00ff00,
        description: message,
        header: { title: "Success", symbol: ":white_check_mark:" },
        trigger: this.msg
      })
    );
  }

  public error(message: string) {
    return this.reply(
      formatResponse({
        color: 0xff0000,
        description: message,
        header: { title: "Error", symbol: ":exclamation:" },
        trigger: this.msg
      })
    );
  }

  public invalid(message: string) {
    return this.reply(
      formatResponse({
        color: 0xffff00,
        description: message,
        header: { title: "Invalid input", symbol: ":x:" },
        trigger: this.msg
      })
    );
  }

  public warn(message: string) {
    return this.reply(
      formatResponse({
        color: 0xffff00,
        description: message,
        header: { title: "Warning", symbol: ":warning:" },
        trigger: this.msg
      })
    );
  }

  public partialSuccess(message: string) {
    return this.reply(
      formatResponse({
        color: 0xffff00,
        description: message,
        header: { title: "Partial Success", symbol: ":warning:" },
        trigger: this.msg
      })
    );
  }

  public getArg<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }
}
