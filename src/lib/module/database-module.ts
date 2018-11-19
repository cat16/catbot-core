import Module from ".";
import Bot from "../bot";
import ModuleDatabase from "../database/module-database";
import DatabaseModuleCreateInfo, {
  GetModuleDatabaseFunction
} from "./database-create-info";

export default class DatabaseModule extends Module {
  private getDatabaseFunc: GetModuleDatabaseFunction;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: DatabaseModuleCreateInfo
  ) {
    super(fileName, bot, directory, createInfo);
    this.getDatabaseFunc = createInfo.getDatabase;
  }
  public getDatabase(): ModuleDatabase {
    return this.getDatabaseFunc.call(this);
  }
}
