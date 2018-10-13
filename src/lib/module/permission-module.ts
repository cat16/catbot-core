import Command from './command/command';
import Module from './module';

export default abstract class PermissionModule extends Module {
  public abstract hasPermission(command: Command);
}
