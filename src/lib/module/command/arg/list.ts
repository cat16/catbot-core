export default class ArgList {
  public content: string;
  private args: Map<string, any>;

  constructor(args: Map<string, any>, content: string) {
    this.args = args;
    this.content = content;
  }

  public get(arg: string): any {
    return this.args.get(arg);
  }
}
