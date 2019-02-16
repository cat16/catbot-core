import Logger from "../util/logger";
import DatabaseInterface from "./database-interface";

export interface DatabaseVariableOptions<T> {
  initValue?: T | (() => T);
  unique?: boolean;
}

export default class DatabaseVariable<T> {
  public readonly key: string;
  public readonly dbi: DatabaseInterface;

  constructor(
    dbi: DatabaseInterface,
    key: string,
    { unique = true, initValue = undefined }: DatabaseVariableOptions<T> = {}
  ) {
    this.dbi = dbi;

    const newKey = unique ? this.dbi.createUniqueKey(key) : key;
    if (key !== newKey) {
      
    }
    this.dbi.registerKey(newKey);
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
}
