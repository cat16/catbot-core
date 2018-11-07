import CommandInstance from "./command/instance";
import BotModule from "./module";

export default abstract class PermissionModule extends BotModule {
  public abstract hasPermission(command: CommandInstance);
}
