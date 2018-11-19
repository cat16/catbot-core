export default abstract class ModuleDatabase {
  private static currentId: number;

  private readonly id: number;

  constructor() {
    this.id = ModuleDatabase.currentId++;
  }

  public abstract async get<T>(key: string[]): Promise<T>;
  public abstract async set<T>(key: string[], value: T): Promise<void>;

  public getId(): number {
    return this.id;
  }
}
