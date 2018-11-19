import { ModuleCreateInfo } from "../..";
import ModuleDatabase from "../database/module-database";
import DatabaseModule from "./database-module";

export type GetModuleDatabaseFunction = (
  this: DatabaseModule
) => ModuleDatabase;

export default interface DatabaseModuleCreateInfo extends ModuleCreateInfo {
  getDatabase: GetModuleDatabaseFunction;
}

export function isDatabaseModuleCreateInfo(
  object: any
): object is DatabaseModuleCreateInfo {
  return object
    ? (object as DatabaseModuleCreateInfo).getDatabase !== undefined
    : false;
}
