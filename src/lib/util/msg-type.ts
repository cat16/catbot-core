import chalk, { Chalk } from "chalk";

export default class MsgType {
  public static INFO = new MsgType("info", chalk.blue);
  public static SUCCESS = new MsgType("success", chalk.green);
  public static WARN = new MsgType("warn", chalk.yellow);
  public static ERROR = new MsgType("error", chalk.red);
  public static DEBUG = new MsgType("debug", chalk.yellow);
  public static INPUT = new MsgType("input", chalk.yellow);

  public readonly name: string;
  public readonly color: Chalk;

  constructor(name: string, color: Chalk) {
    this.name = name;
    this.color = color;
  }

  public getColoredName(): string {
    return this.color(this.name);
  }
}
