import Logger from "../util/logger";
import ModuleDatabase from "./module-database";

export default class DatabaseInterface {
  private readonly logger: Logger;

  private db: ModuleDatabase;
  private registeredKeys: string[];
  private cache: Map<string, any>;

  private loaded: boolean;

  constructor() {
    this.logger = new Logger(`db-client`);
    this.db = null;
    this.registeredKeys = [];
  }

  public setDB(db: ModuleDatabase): void {
    this.db = db;
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
      this.loaded = true;
      resolve();
    });
  }

  public registerKey(key: string): boolean {
    if (!this.registeredKeys.some(k => k === key)) {
      this.registeredKeys.push(key);
      return true;
    } else {
      return false;
    }
  }

  public async get(key: string): Promise<any> {
    return this.db.get(key);
  }

  public async set<T>(key: string, value: T): Promise<void> {
    this.db.set(key, value);
  }
}
