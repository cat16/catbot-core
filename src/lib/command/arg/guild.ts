import ArgValidator from "./validator";
import Bot from "../../bot";

export abstract class GuildArgValidator<T> extends ArgValidator<T> {
  public abstract validate(
    text: string,
    bot: Bot,
    msg: Message
  ): ArgSuccess<T> | ArgFailure;
}
