import { DMChannel, User } from "discord.js";
import ValidatorContext from "./context";

export default interface DMValidatorContext extends ValidatorContext {
  user: User;
  channel: DMChannel;
}
