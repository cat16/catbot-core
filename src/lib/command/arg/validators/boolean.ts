import { array } from "../../../util";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class BooleanValidator extends ArgValidator<boolean> {
  public readonly trueStrs: string[];
  public readonly falseStrs: string[];
  constructor(
    trueStrs: string | string[] = "true",
    falseStrs: string | string[] = "false"
  ) {
    super();
    this.trueStrs = array(trueStrs);
    this.falseStrs = array(falseStrs);
  }
  public validate(text: string) {
    const trueMatch = this.trueStrs.find(str => text.startsWith(str));
    const falseMatch = this.falseStrs.find(str => text.startsWith(str));
    const match = trueMatch || falseMatch;
    if (match) {
      return new ArgSuccess(
        match === trueMatch,
        text.slice(trueMatch.length).trim()
      );
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }
  public getRequirements() {
    return [
      `${this.inputStr} must start with one of the following strings:` +
        `\n${this.trueStrs
          .concat(this.falseStrs)
          .map(str => `'${str}'`)
          .join(", ")}`
    ];
  }
}
