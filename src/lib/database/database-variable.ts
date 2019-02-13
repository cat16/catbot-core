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

    this.initValue = initValue;
    this.dbi.registerDBK(this);
  }

  public getKey(): string[] {
    return this.key;
  }

  public getValue(): T {
    return this.value;
  }

  public async setValue(value: T): Promise<void> {
    this.value = value;
    return this.dbi.set(this, value);
  }

  public getInitValue(): T {
    return this.initValue instanceof Function
      ? this.initValue()
      : this.initValue;
  }

  public async load(): Promise<void> {
    let newValue = await this.dbi.get(this);
    if (newValue === undefined) {
      newValue = this.getInitValue();
      await this.dbi.set(this, newValue);
    }
    this.value = newValue;
  }
}
