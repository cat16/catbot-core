import Bot from "../../bot";
import ArgFailure from "./result/fail";
import ArgSuccess from "./result/success";

export type ValidateFunction<T> = (
  text: string,
  bot: Bot
) => ArgSuccess<T> | ArgFailure;

export default class ArgTypeOptions<T> {
  public validate: ValidateFunction<T>;
}
