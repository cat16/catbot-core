import ModuleDatabase from "./module-database";

export default class RuntimeDatabase extends ModuleDatabase {
  private readonly variables: Map<string, any>;

  constructor() {
    super();
    this.variables = new Map<string, any>();
  }

  public get(key: string): any {
    return this.variables.get(key);
  }

  public async set(key: string, value: any) {
    this.variables.set(key, value);
  }
}
