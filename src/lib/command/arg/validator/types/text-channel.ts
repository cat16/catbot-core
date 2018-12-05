import { TextChannel } from "eris";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import GuildArgValidator from "../guild";
import GuildValidatorContext from "../guild-context";

export default class TextChannelValidator extends GuildArgValidator<
  TextChannel
> {
  public validate(text: string, context: GuildValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);
    const channel = bot.util.getTextChannel(parts[0], context.guild);
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
