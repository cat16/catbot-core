import chalk from "chalk";
import { getInput } from ".";
import MsgType from "./msg-type";
import { inspect } from "util";

const twoDigit = (num: string) => {
  return num.length === 1 ? `0${num}` : num;
};

export default class Logger {
  public name: string;

  constructor(name: string, parent?: Logger, field?: string) {
    name = chalk.cyan(name);
    name = parent == null ? name : `${parent.name}${chalk.gray("->")}${name}`;
    name = field == null ? name : `${name}::${field}`;
    this.name = name;
  }

  public getLogString(msg: any, msgType: MsgType = MsgType.INFO) {
    if(typeof msg !== "string") {
      msg = inspect(msg);
    }
    const date = chalk.gray(this.getLogDateString(new Date()));
    const name = this.name;
    const type = msgType.getColoredName();
    return `[${date}] [${name}] [${type}] ${msg}`;
  }

  public getLogDateString(d: Date): string {
    const year = `${d.getFullYear()}`;
    const month = twoDigit(`${d.getMonth() + 1}`);
    const day = twoDigit(`${d.getDate()}`);
    const hour = twoDigit(`${d.getHours()}`);
    const min = twoDigit(`${d.getMinutes()}`);
    const sec = twoDigit(`${d.getSeconds()}`);
    return `${day}-${month}-${year}|${hour}:${min}:${sec}`;
  }

  /**
   * prints general information to the console
   */
  public info(msg: any, newLine = true) {
    this.log(msg, newLine, MsgType.INFO);
  }

  /**
   * prints a success to the console
   */
  public success(msg: any, newLine = true) {
    this.log(msg, newLine, MsgType.SUCCESS);
  }

  /**
   * prints a warning to the console
   */
  public warn(msg: any, newLine = true) {
    this.log(msg, newLine, MsgType.WARN);
  }

  /**
   * prints an error to the console
   */
  public error(msg: any, newLine = true) {
    this.log(msg, newLine, MsgType.ERROR);
  }

  /**
   * prints debug information to the console
   */
  public debug(msg: any, newLine = true) {
    this.log(msg, newLine, MsgType.DEBUG);
  }

  /**
   * logs a message to the console
   */
  public log(msg: any, newLine = true, type?: MsgType) {
    const send = this.getLogString(msg, type);
    switch (type) {
      default:
        process.stdout.write(`${send}${newLine ? `\n` : ``}`);
        break;
      case MsgType.WARN:
      case MsgType.ERROR:
        process.stderr.write(`${send}${newLine ? `\n` : ``}`);
        break;
    }
  }

  public getInput(msg?: string): Promise<string> {
    this.log(msg || "", false, MsgType.INPUT);
    return getInput();
  }
}
