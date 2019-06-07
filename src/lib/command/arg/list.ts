import Arg from ".";

export default class ArgList {
  private args: Map<Arg<any>, any>;
  private _content: string;
  get content() {
    return this._content;
  }

  constructor(args: Map<Arg<any>, any>, content: string) {
    this.args = args;
    this._content = content;
  }

  public get<K>(arg: Arg<K>): K {
    return this.args.get(arg);
  }
}
