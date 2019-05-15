import { URL } from "url";
import ArgValidator from "..";
import { isURL } from "../../../../util";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import ValidatorContext from "../context";

export default class URLValidator extends ArgValidator<
  URL
> {
  public validate(text: string, context: ValidatorContext) {
    const bot = context.bot;
    const parts = text.split(" ", 2);

    if (isURL(parts[0])) {
      return new ArgSuccess(new URL(parts[0]), parts[1]);
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
