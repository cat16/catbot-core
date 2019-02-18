import { mapPromiseAll } from "../util";
import ModuleDatabase from "./module-database";

export type SyncFunc = (value: any) => void;

export default class DatabaseInterface {
  private db: ModuleDatabase;
  private registeredKeys: string[];
  private cache: Map<string, any>;
  private initValues: Map<string, any>;
  private syncFuncs: Map<string, SyncFunc>;

  private loaded: boolean;

  constructor() {
    this.db = null;
    this.registeredKeys = [];
    this.initValues = new Map<string, any>();
    this.syncFuncs = new Map<string, SyncFunc>();
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

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async load(): Promise<void> {
    await mapPromiseAll(this.initValues, async (key, value) => {
      if ((await this.get(key)) === undefined && value !== undefined) {
        await this.set(key, value);
      }
    });
    await mapPromiseAll(this.syncFuncs, async (key, func) => {
      const value = await this.get(key);
      await func(value);
    });
    this.loaded = true;
  }

  public createUniqueKey(key: string): string {
    const OGKey = key;
    let count = 0;
    while (this.registeredKeys.some(k => k === key)) {
      count++;
      key = OGKey + (count + 1);
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

  public addSyncFunction(key: string, func: SyncFunc) {
    this.syncFuncs.set(key, func);
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
}
