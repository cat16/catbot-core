import Logger from "../util/logger";
import ModuleDatabase from "./module-database";

export default class DatabaseInterface {
  private logger: Logger;

  private db: ModuleDatabase;
  private registeredKeys: string[];
  private cache: Map<string, any>;
  private defaultValues: Map<string, any>;

  private loaded: boolean;

  constructor() {
    this.logger = new Logger(`empty-db-interface`);
    this.db = null;
    this.registeredKeys = [];
    this.defaultValues = new Map<string, any>();
  }

  public setDB(db: ModuleDatabase): void {
    this.db = db;
    this.logger = new Logger(`db-${this.db.getId()}-interface`);
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

  public load(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.cache) {
        this.registeredKeys.forEach(key => {
          this.cache.set(key, this.db.get(key));
        });
      }
      this.defaultValues.forEach((value, key) => {
        if(this.get(key) === undefined) {
          this.set(key, value);
        }
      })
      this.loaded = true;
      resolve();
    });
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

  public registerDefaultValue(key: string, value: any, override: boolean): boolean {
    if(this.defaultValues.has(key) && !override) {
      return false;
    } else {
      this.defaultValues.set(key, value);
      return true;
    }
  }

  /**
   * Retrieves data from the database
   * @param key - the key of the value you want to get
   */
  public async get(key: string): Promise<any> {
    return this.db.get(key);
  }

  /**
   * Sets data in the database
   * @param key - The key of the data you want to set
   * @param value - The value you want to set the data to; if undefined, it will delete the data instead
   */
  public async set(key: string, value: any): Promise<void> {
    if(value === undefined) {
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
