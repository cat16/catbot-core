import ArgOptions from "./options";
import ArgType from "./type";

export default class Arg {
  public name: string;
  public types: ArgType[];

  constructor(options: ArgOptions) {
    this.name = options.name;
    this.types = options.types || [ArgType.ANY];
  }
}
