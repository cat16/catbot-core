import Command from "./command";
import BotModule from "./module";

export default abstract class PermissionModule extends BotModule {
  public abstract hasPermission(command: Command);
}
