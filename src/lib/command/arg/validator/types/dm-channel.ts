import { PrivateChannel } from "eris";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";
import DMArgValidator from "../dm";

export default class DMChannelValidator extends DMArgValidator<PrivateChannel> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
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
