import ArgSuccess from "../result/success";
import ArgValidator from "../validator";

export default class WordValidator extends ArgValidator<string> {
  public validate(text: string) {
    const word = text.split(" ")[0];
    return new ArgSuccess(word, text.substring(word.length).trimLeft());
  }
  public getRequirements() {
    return [`${this.inputStr} must be a spaceless string`];
  }
}
