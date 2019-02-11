import { PrivateChannel, User } from "eris";
import ValidatorContext from "./context";

export default interface DMValidatorContext extends ValidatorContext {
  user: User;
  channel: PrivateChannel;
}
