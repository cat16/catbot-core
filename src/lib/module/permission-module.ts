import Module from ".";
import Command from "./command";

export default abstract class PermissionModule extends Module {
  public abstract hasPermission(command: Command);
}
