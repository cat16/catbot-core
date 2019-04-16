
import { DMChannel } from "discord.js";
import { trimID } from "../../../../util/bot";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";
import DMArgValidator from "../dm";

export default class DMChannelValidator extends DMArgValidator<DMChannel> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);
    const channel = bot.getClient().channels.get(trimID(parts[0]));
    if (channel instanceof DMChannel) {
      return new ArgSuccess(channel, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [`${this.inputStr} must be a valid DM channel (user mention or id)`];
  }
}
