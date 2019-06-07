import ArgValidator from "..";
import Command from "../../..";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";

export default class CommandValidator extends ArgValidator<Command> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
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
