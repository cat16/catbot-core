import { Guild, GuildChannel, Member } from "eris";
import ValidatorContext from "./context";

export default interface GuildValidatorContext extends ValidatorContext {
  member: Member;
  channel: GuildChannel;
  guild: Guild;
}
