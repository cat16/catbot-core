import {
  Channel,
  Guild,
  GuildChannel,
  GuildMember,
  Message,
  User
} from "discord.js";
import Bot from "../../../bot";

export default interface ValidatorContext<C extends Channel = Channel> {
  bot: Bot;
  msg: Message;
  user: C extends GuildChannel ? GuildMember : User;
  channel: C;
  guild?: C extends GuildChannel ? Guild : undefined;
}
