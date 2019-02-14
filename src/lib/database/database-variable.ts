import Logger from "../util/logger";
import DatabaseInterface from "./database-interface";

export default class DatabaseVariable<T> {
  public readonly key: string;
  public readonly dbi: DatabaseInterface;

  constructor(
    dbi: DatabaseInterface,
    key: string,
    initValue?: T | (() => T)
  ) {
    this.dbi = dbi;
    let times = 1;
    const OG = key;
    while (
      !dbi.registerKey(key)
    ) {
      times++;
      key = OG + (times + 1);
    }
    if (times > 1) {
      
    }
    this.key = key;
  }

  public getKey(): string {
    return this.key;
  }

  public get(): Promise<T> {
    return this.dbi.get(this.key);
  }

  public async set(value: T): Promise<void> {
    return this.dbi.set(this.key, value);
  }
}
