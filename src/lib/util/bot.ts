import chalk from "chalk";
import { Message, RichEmbed, User } from "discord.js";
import { array } from ".";

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
