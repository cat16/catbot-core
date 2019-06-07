import { DMChannel } from "discord.js";
import ArgValidator from "..";
import { trimID } from "../../../../util/bot";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";

export default class DMChannelValidator extends ArgValidator<DMChannel> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);
    const channel = bot.client.channels.get(trimID(parts[0]));
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
