import Logger from "../util/logger";
import DatabaseInterface from "./database-interface";

export default class DatabaseVariable<T> {
  private static readonly usedKeys: Map<number, string[][]>;

  public readonly key: string[];
  public readonly dbi: DatabaseInterface;

  private readonly logger: Logger;
  private readonly initValue?: T | (() => T);
  private value: T;

  constructor(
    dbi: DatabaseInterface,
    key: string[],
    initValue?: T | (() => T)
  ) {
    this.logger = new Logger(`database`, null, key.join("."));
    this.dbi = dbi;
    let times = 0;
    const OG = key[key.length];
    while (
      dbi
        .getDBKs()
        .map(dbk => dbk.getKey())
        .find(k => k === key)
    ) {
      times++;
      key[key.length - 1] = OG + (times + 1);
    }
    if (times > 0) {
      this.logger.warn(
        `Key '${key}' used ${times} time${
          times > 1 ? "s" : ""
        } already; renaming one key to ${OG + (times + 1)}.`
      );
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

  public async load(): Promise<T> {
    let newValue = await this.dbi.get(this);
    if (newValue === undefined) {
      newValue = this.getInitValue();
      await this.dbi.set(this, newValue);
    }
    this.value = newValue;
    return newValue;
  }
}
