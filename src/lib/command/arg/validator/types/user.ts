import { User } from "discord.js";
import { trimID } from "../../../../util/bot";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";
import GenericArgValidator from "../generic";

export default class UserValidator extends GenericArgValidator<User> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);
    const user = bot.client.fetchUser(trimID(parts[0]));
    if (user) {
      return new ArgSuccess(user, parts[1]);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }
  public getRequirements() {
    return [`${this.inputStr} must be a valid user (user mention or id)`];
  }
}
