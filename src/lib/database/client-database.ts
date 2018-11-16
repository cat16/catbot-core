import Logger from "../util/logger";
import DatabaseVariable from "./database-variable";
import ModuleDatabase from "./module-database";

export default class ClientDatabase {
  private static currentId: number;

  private readonly logger: Logger;
  private readonly id: number;

  private db: ModuleDatabase;
  private dbks: DatabaseVariable<any>[];

  constructor(db: ModuleDatabase) {
    this.logger = new Logger(`db-client-${ClientDatabase.currentId}`);
    this.db = db;
    this.id = ClientDatabase.currentId++;
  }

  public init(): Promise<number> {
    return new Promise((resolve, reject) => {
      let finished = 0;
      let rejection = false;
      for (const dbk of this.dbks) {
        dbk.update().then(
          () => {
            if (++finished === this.dbks.length && !rejection) {
              resolve(finished);
            }
          },
          () => {
            rejection = true;
            reject(finished);
          }
        );
      }
    });
  }

  public registerDBK(key: DatabaseVariable<any>) {
    if (!this.dbks.find(d => d.getKey() === key.getKey())) {
      this.dbks.push(key);
    } else {
      this.logger.warn(`key ${key.getKey().join(".")} registered already`);
    }
  }

  public async get<T>(key: DatabaseVariable<T>, defaultValue?: T): Promise<T> {
    return this.db.get<T>(key.getKey()) || defaultValue;
  }

  public async set<T>(key: DatabaseVariable<T>, value: T): Promise<void> {
    this.db.set(key.getKey(), value);
  }

  public getId(): number {
    return this.id;
  }
}
