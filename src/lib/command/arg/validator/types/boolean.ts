import ArgValidator from "..";
import { array } from "../../../../util";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";

export default class BooleanValidator extends ArgValidator<boolean> {
  private _trueStrs: string[];
  private _falseStrs: string[];

  constructor(
    trueStrs: string | string[] = "true",
    falseStrs: string | string[] = "false"
  ) {
    super();
    this._trueStrs = array(trueStrs);
    this._falseStrs = array(falseStrs);
  }

  get trueStrs(): string[] {
    return this._trueStrs;
  }

  get falseStrs(): string[] {
    return this._falseStrs;
  }

  public validate(text: string) {
    const trueMatch = this.trueStrs.find(str => text.startsWith(str));
    const falseMatch = this.falseStrs.find(str => text.startsWith(str));
    const match = trueMatch || falseMatch;
    if (match) {
      return new ArgSuccess(
        match === trueMatch,
        text.slice(trueMatch ? trueMatch.length : falseMatch.length).trim()
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
