import { array } from "../../util";
import ArgType from "./type";

export default class Arg {
  public name: string;
  public types: ArgType<any>[];

  constructor(
    name: string,
    types: ArgType<any> | ArgType<any>[] = [ArgType.WORD]
  ) {
    this.name = name;
    this.types = array(types);
  }
}
