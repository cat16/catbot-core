import Arg from ".";
import ArgValidator from "./validator";
import WordValidator from "./validator/types/word";

export default class DefaultArg extends Arg<string> {
  constructor(name: string) {
    super(name, new WordValidator());
  }
  public with<T>(validator: ArgValidator<T>): Arg<T> {
    return new Arg(this.name, validator);
  }
}
