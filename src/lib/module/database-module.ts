import ModuleDatabase from "../database/module-database";
import BotModule from "./module";

export default abstract class DatabaseModule extends BotModule {
  public abstract getDatabase(): ModuleDatabase;
}
