import ArgValidator from ".";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import GuildValidatorContext from "./guild-context";

export default abstract class GuildArgValidator<T> extends ArgValidator<T> {
  public abstract validate(
    text: string,
    context: GuildValidatorContext
  ): ArgSuccess<T | Promise<T>> | ArgFailure;
}
