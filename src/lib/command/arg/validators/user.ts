import { User } from "eris";
import Bot from "../../../bot";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class UserValidator extends ArgValidator<User> {
  public validate(text: string, bot: Bot) {
    const parts = text.split(" ", 2);
    const user = bot.util.getUser(parts[0]);
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
