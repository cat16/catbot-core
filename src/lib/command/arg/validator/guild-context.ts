import { Guild, GuildChannel, GuildMember } from "discord.js";
import ValidatorContext from "./context";

export default interface GuildValidatorContext extends ValidatorContext {
  member: GuildMember;
  channel: GuildChannel;
  guild: Guild;
}
