import Arg from "./arg";
import CommandCreateInfo from "./create-info";
import { CommandPermissionContext } from "./permission-context";
import CommandRunContext from "./run-context";
import RunnableCommand from "./runnable";

export type CommandRunFunc = (
  this: RunnableCommand,
  context: CommandRunContext
) => Promise<void> | void;

export type CommandPermissionFunc = (
  this: RunnableCommand,
  context: CommandPermissionContext
) => Promise<boolean>;

export default interface RunnableCommandCreateInfo extends CommandCreateInfo {
  run: CommandRunFunc;
  hasPermission?: CommandPermissionFunc;
  args?: Arg<any>[];
}

export function isRunnableCommandCreateInfo(object) {
  return object
    ? (object as RunnableCommandCreateInfo).run !== undefined
    : false;
}
