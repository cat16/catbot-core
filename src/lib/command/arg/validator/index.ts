import { Channel } from "discord.js";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ValidatorContext from "./context";

export default abstract class ArgValidator<T, C extends Channel = Channel> {
  public static readonly inputStr = "[INPUT]";
  public readonly inputStr = ArgValidator.inputStr;

  // TODO: if typescript adds overriding then I can remove the types on the methods in the child classes
  public abstract validate(
    text: string,
    context: ValidatorContext<C>
  ): ArgSuccess<T | Promise<T>> | ArgFailure;
  public abstract getRequirements(): string[];
}
