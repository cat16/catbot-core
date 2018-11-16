import Logger from "../util/logger";
import ClientDatabase from "./client-database";

export default class DatabaseVariable<T> {
  private static readonly usedKeys: Map<number, string[][]>;

  private readonly logger: Logger;
  private readonly db: ClientDatabase;
  private readonly defaultValue?: T;

  private readonly key: string[];
  private value: T;

  constructor(db: ClientDatabase, key: string[], defaultValue?: T) {
    this.logger = new Logger(`database-${db.getId()}`, null, key.join("."));
    this.db = db;
    let times = 0;
    const OG = key[key.length];
    while (DatabaseVariable.usedKeys.get(db.getId()).find(k => k === key)) {
      times++;
      key[key.length - 1] = OG + (times + 1);
    }
    if (times > 0) {
      this.logger.warn(
        `Key '${key}' used ${times} time${
          times > 1 ? "s" : ""
        } already; renaming one key to ${OG + (times + 1)}`
      );
    }
    this.key = key;

    this.defaultValue = defaultValue;
    this.db.registerDBK(this);
  }

  public getKey(): string[] {
    return this.key;
  }

  public getValue(): T {
    return this.value;
  }

  public async setValue(value: T): Promise<void> {
    this.value = value;
    return this.db.set(this, value);
  }

  public getDefaultValue(): T {
    return this.defaultValue;
  }

  public async update(): Promise<T> {
    const newValue = await this.db.get(this, this.defaultValue);
    this.value = newValue;
    return newValue;
  }
}
