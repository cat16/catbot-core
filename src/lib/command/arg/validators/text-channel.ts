import { Message, TextChannel } from "eris";
import Bot from "../../../bot";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class TextChannelValidator extends ArgValidator<TextChannel> {
  public validate(text: string, bot: Bot, msg: Message) {
    const parts = text.split(" ", 2);
    const channel = bot.util.getTextChannel(parts[0], msg.channel);
    if (channel) {
      return new ArgSuccess(channel, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [
      `${this.inputStr} must be a valid text channel (channel mention or id)`
    ];
  }
}
