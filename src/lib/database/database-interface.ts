import { mapPromiseAll } from "../util";
import DatabaseNotSetError from "./error/database-not-set";
import ModuleDatabase from "./module-database";

export type OnLoadFunc = (value: any) => void;

export default class DatabaseInterface {
  private db: ModuleDatabase;
  private registeredKeys: string[];
  private cache: Map<string, any>;
  private initValues: Map<string, any>;
  private onLoadFuncs: Map<string, OnLoadFunc[]>;

  private loaded: boolean;

  constructor() {
    this.db = null;
    this.registeredKeys = [];
    this.initValues = new Map<string, any>();
    this.onLoadFuncs = new Map<string, OnLoadFunc[]>();
  }

  public setDB(db: ModuleDatabase): void {
    this.db = db;
  }

  public getId(): number {
    return this.db.getId();
  }

  public useCache(useCache: boolean) {
    this.cache = useCache ? new Map<string, any>() : null;
  }

  /**
   * Loads all database variables that were registered
   */
  public async load(): Promise<void> {
    if (this.db == null) {
      throw new DatabaseNotSetError();
    }
    await mapPromiseAll(this.initValues, async (key, value) => {
      let finalValue = await this.get(key);
      if (finalValue === undefined && value !== undefined) {
        if (value instanceof Promise) {
          value = await value;
        }
        await this.set(key, value);
        finalValue = value;
      }
      for (const func of this.onLoadFuncs.get(key)) {
        await func(finalValue);
      }
    });
  }

  public createUniqueKey(key: string): string {
    const originalKey = key;
    let count = 0;
    while (this.registeredKeys.some(k => k === key)) {
      count++;
      key = originalKey + (count + 1);
    }
    return key;
  }

  public registerKey(key: string, unique: boolean = true): boolean {
    if (!this.registeredKeys.some(k => k === key)) {
      this.registeredKeys.push(key);
      return true;
    } else {
      return !unique;
    }
  }

  public unregisterKey(key: string): boolean {
    const index = this.registeredKeys.indexOf(key);
    if (index === -1) {
      return false;
    } else {
      this.registeredKeys.splice(index, 1);
      return true;
    }
  }

  public registerInitValue(
    key: string,
    value: any,
    override: boolean = false
  ): boolean {
    if (this.initValues.has(key) && !override) {
      return false;
    } else {
      this.initValues.set(key, value);
      return true;
    }
  }

  public onLoad(key: string, func: OnLoadFunc) {
    if (!this.onLoadFuncs.has(key)) {
      this.onLoadFuncs.set(key, [func]);
    } else {
      this.onLoadFuncs.get(key).push(func);
    }
  }

  /**
   * Retrieves data from the database
   * @param key - the key of the value you want to get
   */
  public async get(key: string): Promise<any> {
    if (this.cache && this.cache.get(key) !== undefined) {
      return this.cache.get(key);
    } else {
      const value = this.db.get(key);
      if (this.cache) {
        this.cache.set(key, value);
      }
      return value;
    }
  }

  /**
   * Sets data in the database
   * @param key - The key of the data you want to set
   * @param value - The value you want to set the data to; if undefined, it will delete the data instead
   */
  public async set(key: string, value: any): Promise<void> {
    if (this.cache) {
      this.cache.set(key, value);
    }
    if (value === undefined) {
      return this.delete(key);
    } else {
      return this.db.set(key, value);
    }
  }

  /**
   * Deletes data from the database
   * @param key - the key of the data you want to delete
   */
  public async delete(key: string): Promise<void> {
    return this.db.delete(key);
  }

  public isLoaded(): boolean {
    return this.loaded;
  }
}
