export default abstract class ModuleDatabase {
  public abstract async get(key: string[]): Promise<any>;
  public abstract async set(key: string[], value: any): Promise<void>;
}
