import DatabaseInterface from "./database-interface";
import DatabaseNotLoadedError from "./database-not-loaded";
import DatabaseVariable, { DatabaseVariableOptions } from "./database-variable";

/**
 * Basically a perminantly cached database variable
 */
export default class SavedVariable<T> extends DatabaseVariable<T> {
  private value: T;

  constructor(
    dbi: DatabaseInterface,
    key: string,
    options?: DatabaseVariableOptions<T>
  ) {
    super(dbi, key, options);
    this.dbi.addSyncFunction(this.key, (value) => {this.value = value});
  }

  public getValue(): T {
    if (!this.dbi.isLoaded()) {
      throw new DatabaseNotLoadedError(this.dbi);
    }
    return this.value;
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
