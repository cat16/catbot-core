import { array } from "../../util";
import ArgValidator from "./validator";

export default class Arg<T> {
  public readonly name;
  public readonly validationFuncs: ArgValidator<T>[];

  constructor(name: string, validators: ArgValidator<T> | ArgValidator<T>[]) {
    this.name = name;
    this.validationFuncs = array(validators);
  }

  public or<T2>(validateFunc: ArgValidator<T2>): Arg<T | T2> {
    return new Arg<T | T2>(this.name, [...this.validationFuncs, validateFunc]);
  }
}
