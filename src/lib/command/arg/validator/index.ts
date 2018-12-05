import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ValidatorContext from "./context";

export default abstract class ArgValidator<T> {
  public static readonly inputStr = "[INPUT]";
  public readonly inputStr = ArgValidator.inputStr;
  public abstract validate(
    text: string,
    context: ValidatorContext
  ): ArgSuccess<T | Promise<T>> | ArgFailure;
  public abstract getRequirements(): string[];
}
