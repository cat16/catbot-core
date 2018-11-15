import Module from ".";
import ModuleDatabase from "../database/module-database";

export default abstract class DatabaseModule extends Module {
  public abstract getDatabase(): ModuleDatabase;
}
