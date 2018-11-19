import ModuleDatabase from "./module-database";

export default class RuntimeDatabase extends ModuleDatabase {
  private readonly variables: Map<string[], any>;

  constructor() {
    super();
    this.variables = new Map<string[], any>();
  }

  public get<T>(key: string[]): T {
    return this.variables.get(key);
  }

  public async set<T>(key: string[], value: T) {
    this.variables.set(key, value);
  }
}
