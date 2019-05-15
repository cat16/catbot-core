
import { VoiceChannel } from "discord.js";
import { trimID } from "../../../../util/bot";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";
import GuildArgValidator from "../guild";

export default class VoiceChannelValidator extends GuildArgValidator<
  VoiceChannel
> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);
    const channel = bot.client.channels.get(trimID(parts[0]));
    if (channel && channel instanceof VoiceChannel) {
      return new ArgSuccess(channel, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [`${this.inputStr} must be a valid voice channel (channel id)`];
  }
}
