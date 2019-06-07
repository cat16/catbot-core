import { array } from "../../util";
import CommandRunContext from "../runnable/run-context";
import ArgValidator from "./validator";

export default class Arg<T> {
  private _name: string;
  private _validationFuncs: ArgValidator<T>[];

  public get name() {
    return this._name;
  }

  public get validationFuncs(): ArgValidator<T>[] {
    return this._validationFuncs;
  }

  constructor(name: string, validators: ArgValidator<T> | ArgValidator<T>[]) {
    this._name = name;
    this._validationFuncs = array(validators);
  }

  // TODO: and

  public or<T2>(validateFunc: ArgValidator<T2>): Arg<T | T2> {
    return new Arg<T | T2>(this.name, [...this.validationFuncs, validateFunc]);
  }

  public from(context: CommandRunContext): T {
    return context.args.get(this);
  }
}
