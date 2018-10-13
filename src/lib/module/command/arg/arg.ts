import ArgOptions from "./arg-options";
import ArgType from "./arg-type";

export default class Arg {
  public name: string;
  public types: ArgType[];

  constructor(options: ArgOptions) {
    this.name = options.name;
    this.types = options.types || [ArgType.ANY];
  }
}
