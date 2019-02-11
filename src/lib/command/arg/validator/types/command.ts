import Command from "../../..";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";
import GenericArgValidator from "../generic";

export default class CommandValidator extends GenericArgValidator<Command> {
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
