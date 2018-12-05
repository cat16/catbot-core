import ArgFailure from "../../result/fail";
import ArgSuccess from "../../result/success";
import GenericArgValidator from "../generic";

export default class StringValidator extends GenericArgValidator<string> {
  public readonly allowed: string[];
  constructor(allowed: string[]) {
    super();
    this.allowed = allowed;
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
