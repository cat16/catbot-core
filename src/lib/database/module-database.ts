export default abstract class ModuleDatabase {
  public abstract async get<T>(key: string[]): Promise<T>;
  public abstract async set<T>(key: string[], value: T): Promise<void>;
}
