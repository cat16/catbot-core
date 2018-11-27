import { VoiceChannel } from "eris";
import Bot from "../../../bot";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class VoiceChannelValidator extends ArgValidator<VoiceChannel> {
  public validate(text: string, bot: Bot) {
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
