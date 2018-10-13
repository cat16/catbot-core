import Bot from "../../../bot";
import ArgResult from "./arg-result";

export type ValidateFunction = (text: string, bot: Bot) => ArgResult;

export default class ArgTypeOptions {
  public validate: ValidateFunction;
}
