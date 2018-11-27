import Arg from ".";

export default class ArgList {
  public content: string;
  private args: Map<Arg<any>, any>;

  constructor(args: Map<Arg<any>, any>, content: string) {
    this.args = args;
    this.content = content;
  }

  public get<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }
}
