import chalk from "chalk";
import {
  CategoryChannel,
  Channel,
  DMChannel,
  GuildChannel,
  Message,
  MessageOptions,
  RichEmbed,
  StringResolvable,
  TextChannel,
  User,
  VoiceChannel
} from "discord.js";
import { array } from ".";
import CommandError from "../command/error";

// TODO: this is dirty but legit the stack overflow solution
export type CommandChannelType =
  | typeof Channel
  | typeof GuildChannel
  | typeof TextChannel
  | typeof VoiceChannel
  | typeof CategoryChannel
  | typeof DMChannel;

export function formatUser(user: User, id: boolean = false): string {
  return (
    chalk.magenta(`${user.username}#${user.discriminator}`) +
    (id ? chalk.grey(` (id:${user.id})`) : "")
  );
}

export interface ResponseCreateInfo {
  header?: {
    title: string;
    symbol: string;
  };
  description: string;
  color?: number;
  trigger?: Message;
}

export function formatResponse(createInfo: ResponseCreateInfo): RichEmbed {
  const header = createInfo.header;
  const description = createInfo.description;
  const color = createInfo.color;
  const trigger = createInfo.trigger;

  const embed = new RichEmbed({
    color,
    description,
    timestamp: trigger ? trigger.createdAt : new Date()
  });

  if (header) {
    embed.setTitle(`${header.symbol} ${header.title} ${header.symbol}`);
  }

  if (trigger) {
    const author = trigger.author;
    embed.setFooter(
      `${author.username}#${author.discriminator}`,
      author.avatarURL
    );
  }
  return embed;
}

export interface ErrorResponseCreateInfo {
  trigger?: Message;
}

export function formatErrorResponse(
  error: CommandError,
  createInfo: ErrorResponseCreateInfo
) {
  return formatResponse({
    color: error.type.color,
    description: error.getMessage(),
    header: {
      symbol: error.type.symbol,
      title: error.type.name
    },
    trigger: createInfo.trigger
  });
}

export function trimID(
  id: string,
  symbols: string | string[] = ["@", "#"]
): string {
  for (const symbol of array(symbols)) {
    if (id.startsWith(`<${symbol}`) && id.endsWith(">")) {
      id = id.slice(2, -1);
      if (id.startsWith("!")) {
        id = id.slice(1);
      }
    }
  }
  return id;
}

export const RESPONSE = {
  info(message: string, topic?: string, trigger?: Message) {
    const description = message;
    return formatResponse({
      color: 0xaaaaff,
      description,
      header: topic
        ? { title: topic, symbol: ":information_source:" }
        : undefined,
      trigger
    });
  },

  list(
    name: string,
    arr: { name: string; description: string }[],
    symbol: string = ":information_source:",
    trigger?: Message
  ) {
    const embed = formatResponse({
      color: 0xaaaaff,
      description: "",
      header: {
        symbol,
        title: name
      },
      trigger
    });
    for (const element of arr) {
      embed.addField(element.name, element.description);
    }
    return embed;
  },

  success(message: string, trigger?: Message) {
    return formatResponse({
      color: 0x00ff00,
      description: message,
      header: { title: "Success", symbol: ":white_check_mark:" },
      trigger
    });
  },

  error(message: string, trigger?: Message) {
    return formatResponse({
      color: 0xff0000,
      description: message,
      header: { title: "Error", symbol: ":exclamation:" },
      trigger
    });
  },

  invalid(message: string, trigger?: Message) {
    return formatResponse({
      color: 0xffff00,
      description: message,
      header: { title: "Invalid input", symbol: ":x:" },
      trigger
    });
  },

  warn(message: string, trigger?: Message) {
    return formatResponse({
      color: 0xffff00,
      description: message,
      header: { title: "Warning", symbol: ":warning:" },
      trigger
    });
  },

  partialSuccess(message: string, trigger?: Message) {
    return formatResponse({
      color: 0xffff00,
      description: message,
      header: { title: "Partial Success", symbol: ":warning:" },
      trigger
    });
  }
};

export class MessageContainer {
  public readonly msg: Message;

  constructor(msg: Message) {
    this.msg = msg;
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
    return this.reply(RESPONSE.info(message, topic, this.msg));
  }

  public list(
    name: string,
    arr: { name: string; description: string }[],
    symbol: string = ":information_source:"
  ) {
    return this.reply(RESPONSE.list(name, arr, symbol, this.msg));
  }

  public success(message: string) {
    return this.reply(RESPONSE.success(message, this.msg));
  }

  public error(message: string) {
    return this.reply(RESPONSE.error(message, this.msg));
  }

  public invalid(message: string) {
    return this.reply(RESPONSE.invalid(message, this.msg));
  }

  public warn(message: string) {
    return this.reply(RESPONSE.warn(message, this.msg));
  }

  public partialSuccess(message: string) {
    return this.reply(RESPONSE.partialSuccess(message, this.msg));
  }
}
