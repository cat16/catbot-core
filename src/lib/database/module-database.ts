export default abstract class ModuleDatabase {
  private static currentId: number;

  private readonly id: number;

  constructor() {
    this.id = ModuleDatabase.currentId++;
  }

  public abstract async get(key: string): Promise<any>;
  public abstract async set(key: string, value: any): Promise<void>;

  public getId(): number {
    return this.id;
  }
}
