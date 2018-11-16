import Bot from "../../bot";
import ArgResult from "./result";

export type ValidateFunction = (text: string, bot: Bot) => ArgResult;

export default class ArgTypeOptions {
  public validate: ValidateFunction;
}
