import ArgValidator from ".";
import ArgFailure from "../result/fail";
import ArgSuccess from "../result/success";
import ValidatorContext from "./context";

export default abstract class GenericArgValidator<T> extends ArgValidator<T> {
  public abstract validate(
    text: string,
    context: ValidatorContext
  ): ArgSuccess<T | Promise<T>> | ArgFailure;
}
