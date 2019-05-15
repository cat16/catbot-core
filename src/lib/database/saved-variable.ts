import DatabaseInterface from "./database-interface";
import DatabaseVariable, { DatabaseVariableOptions } from "./database-variable";
import VariableNotLoadedError from "./error/variable-not-loaded";

/**
 * Basically a perminantly cached database variable
 */
export default class SavedVariable<T> extends DatabaseVariable<T> {
  private value: T;
  private loaded: boolean;

  constructor(
    dbi: DatabaseInterface,
    key: string,
    options?: DatabaseVariableOptions<T>
  ) {
    super(dbi, key, options);
    this.loaded = false;
    this.dbi.addSyncFunction(this.key, value => {
      this.value = value;
      this.loaded = true;
    });
  }

  public getValue(): T {
    if (!this.isLoaded()) {
      throw new VariableNotLoadedError(this.key, this.dbi);
    }
    return this.value;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async get(): Promise<T> {
    return this.value;
  }

  public async set(value: T): Promise<void> {
    this.value = value;
    return super.set(value);
  }

  public async sync(): Promise<T> {
    this.value = await super.get();
    return this.value;
  }

  public async init(): Promise<void> {
    this.value = await super.get();
  }
}
