import { Message } from "eris";
import Bot from "../../../bot";

export default class ValidatorContext {
  public bot: Bot;
  public msg: Message;
}
