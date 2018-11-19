import Arg from ".";

export default class ArgList {
  public content: string;
  private args: Map<Arg, any>;

  constructor(args: Map<Arg, any>, content: string) {
    this.args = args;
    this.content = content;
  }

  public get<T>(arg: Arg): T {
    return this.args.get(arg);
  }
}
