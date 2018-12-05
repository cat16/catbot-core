import { VoiceChannel } from "eris";
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
    const channel = bot.util.getVoiceChannel(parts[0]);
    if (channel) {
      return new ArgSuccess(channel, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [`${this.inputStr} must be a valid voice channel (channel id)`];
  }
}
