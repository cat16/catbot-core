import Logger from "../util/logger";
import DatabaseInterface from "./database-interface";

export interface DatabaseVariableOptions<T> {
  initValue?: T;
  unique?: boolean;
}

export default class DatabaseVariable<T> {
  public readonly key: string;
  public readonly dbi: DatabaseInterface;

  constructor(
    dbi: DatabaseInterface,
    key: string,
    { unique = true, initValue }: DatabaseVariableOptions<T> = {}
  ) {
    this.dbi = dbi;

    const newKey = unique ? this.dbi.createUniqueKey(key) : key;
    if (key !== newKey) {
      // TODO: this is not exactly best practice lol, either make static and maybe add new methods or just add new static methods to logger
      new Logger(`database-variable[${key}]`).warn(
        `Variable key renamed to ${newKey} due to duplicate`
      );
    }
    this.dbi.registerKey(newKey);
    if (initValue !== undefined) {
      this.dbi.registerInitValue(newKey, initValue);
    }
    this.key = newKey;
  }

  public getKey(): string {
    return this.key;
  }

  public async get(): Promise<T> {
    return this.dbi.get(this.key);
  }

  public async set(value: T): Promise<void> {
    return this.dbi.set(this.key, value);
  }

  /**
   * Unregisters the key in the database interface
   * The variable should not be used afterward
   */
  public unload() {
    // TODO: decided whether to make dbi null in order to render it uneffective
    this.dbi.unregisterKey(this.key);
  }

  // TODO: add delete function to also remove the value in the database

}
