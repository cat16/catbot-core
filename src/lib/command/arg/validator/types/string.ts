import ArgValidator from "..";
import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";

export default class StringValidator extends ArgValidator<string> {
  private _allowed: string[];
  public get allowed(): string[] {
    return this._allowed;
  }
  constructor(allowed: string[]) {
    super();
    this._allowed = allowed;
  }
  public validate(text: string) {
    const match = this.allowed.find(str => str === text);
    if (match) {
      return new ArgSuccess(match, text.slice(match.length).trim());
    } else {
      return new ArgFailure(this.getRequirements());
    }
  }

  public getRequirements() {
    return [
      `'${this.inputStr}' must start with any of the following strings:` +
        `\n${this.allowed.map(str => `'${str}'`).join(", ")}`
    ];
  }
}
