import Module from './module'
import Command from './command/command'

export default abstract class PermissionModule extends Module {
  abstract hasPermission(command: Command)
}