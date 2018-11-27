import Command from "../..";
import Bot from "../../../bot";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class CommandValidator extends ArgValidator<Command> {
  public validate(text: string, bot: Bot) {
    const match = bot.commandManager.findMatch(text, {
      allowIncomplete: false
    });
    if (match) {
      return new ArgSuccess(match.element, match.leftover);
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [`'${this.inputStr}' must be a command`];
  }
}
