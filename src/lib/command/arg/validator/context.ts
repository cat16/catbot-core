import { Message } from "discord.js";
import Bot from "../../../bot";

export default class ValidatorContext {
  public bot: Bot;
  public msg: Message;
}
