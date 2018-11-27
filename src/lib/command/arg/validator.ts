import { Guild, Message, User } from "eris";
import Bot from "../../bot";
import ArgFailure from "./result/fail";
import ArgSuccess from "./result/success";

export type ValidationFunction<T> = (
  text: string,
  bot: Bot
) => ArgSuccess<T> | ArgFailure;

export default abstract class ArgValidator<T> {
  public static readonly inputStr = "[INPUT]";
  public readonly inputStr = ArgValidator.inputStr;
  public abstract validate(
    text: string,
    bot: Bot,
    msg: Message
  ): ArgSuccess<T> | ArgFailure;
  public abstract getRequirements(): string[];
}
