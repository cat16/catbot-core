import ArgValidator from ".";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import DMValidatorContext from "./dm-context";

export default abstract class DMArgValidator<T> extends ArgValidator<T> {
  public abstract validate(
    text: string,
    context: DMValidatorContext
  ): ArgSuccess<T | Promise<T>> | ArgFailure;
}
