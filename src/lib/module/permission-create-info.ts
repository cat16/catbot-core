import { ModuleCreateInfo } from "../..";
import { CommandPermissionContext } from "../command/permission-context";
import DatabaseModule from "./database-module";

export type HasPermissionFunction = (
  this: DatabaseModule,
  context: CommandPermissionContext
) => Promise<boolean>;

export default interface PermissionModuleCreateInfo extends ModuleCreateInfo {
  hasPermission: HasPermissionFunction;
}

export function isPermissionModuleCreateInfo(
  object: any
): object is PermissionModuleCreateInfo {
  return object
    ? (object as PermissionModuleCreateInfo).hasPermission !== undefined
    : false;
}
