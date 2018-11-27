import { Guild, PrivateChannel, User } from "eris";
import Bot from "../../../bot";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class DMChannelValidator extends ArgValidator<PrivateChannel> {
  public validate(text: string, bot: Bot, guildOrUser: Guild | User) {
    const parts = text.split(" ", 2);
    const channel = bot.util.getDMChannel(parts[0]);
    if (channel) {
      return new ArgSuccess(channel, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [`${this.inputStr} must be a valid DM channel (user mention or id)`];
  }
}
