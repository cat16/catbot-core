import Module from "..";
import Bot from "../../bot";
import FileElementFactory from "../../util/file-element/factory";
import ModuleCreateInfo, { isModuleCreateInfo } from "../create-info";
import { isDatabaseModuleCreateInfo } from "../database-create-info";
import DatabaseModule from "../database-module";
import { isPermissionModuleCreateInfo } from "../permission-create-info";
import PermissionModule from "../permission-module";
import { inspect } from "util";

export default class ModuleFactory implements FileElementFactory<Module> {
  public readonly bot: Bot;
  public readonly directory: string;

  constructor(bot: Bot, directory: string) {
    this.bot = bot;
    this.directory = directory;
  }

  public create(rawElement: ModuleCreateInfo, fileName: string, path: string) {
    if (isDatabaseModuleCreateInfo(rawElement)) {
      return new DatabaseModule(fileName, this.bot, path, rawElement);
    }
    if (isPermissionModuleCreateInfo(rawElement)) {
      return new PermissionModule(fileName, this.bot, path, rawElement);
    }
    if (isModuleCreateInfo(rawElement)) {
      return new Module(fileName, this.bot, path, rawElement);
    }
    return new Module(fileName, this.bot, path, rawElement);
  }
}
