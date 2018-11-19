import Logger from "../util/logger";
import DatabaseVariable from "./database-variable";
import ModuleDatabase from "./module-database";

export default class DatabaseInterface {
  private readonly logger: Logger;

  private db: ModuleDatabase;
  private dbvs: DatabaseVariable<any>[];

  constructor() {
    this.logger = new Logger(`db-client`);
    this.db = null;
    this.dbvs = [];
  }

  public setDB(db: ModuleDatabase): void {
    this.db = db;
  }

  public load(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.dbvs.length === 0) {
        resolve(0);
      }
      let finished = 0;
      let rejection = false;
      for (const dbv of this.dbvs) {
        dbv.load().then(
          () => {
            if (++finished === this.dbvs.length && !rejection) {
              resolve(finished);
            }
          },
          err => {
            rejection = true;
            reject(
              new Error(
                `Could not load database variable '${dbv
                  .getKey()
                  .join(".")}'!\nReason: ${err.stack}`
              )
            );
          }
        );
      }
    });
  }

  public registerDBK(key: DatabaseVariable<any>) {
    if (!this.dbvs.some(d => d.getKey() === key.getKey())) {
      this.dbvs.push(key);
    } else {
      this.logger.warn(`Key '${key.getKey().join(".")}' registered already!`);
    }
  }

  public getDBKs(): DatabaseVariable<any>[] {
    return this.dbvs;
  }

  public async get<T>(key: DatabaseVariable<T>, defaultValue?: T): Promise<T> {
    return this.db.get<T>(key.getKey()) || defaultValue;
  }

  public async set<T>(key: DatabaseVariable<T>, value: T): Promise<void> {
    this.db.set(key.getKey(), value);
  }
}
