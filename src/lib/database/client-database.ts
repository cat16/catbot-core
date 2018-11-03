import DBK from "./database-key";
import ModuleDatabase from "./module-database";

export default class ClientDatabase {
  private db: ModuleDatabase;
  constructor(db: ModuleDatabase) {
    this.db = db;
  }

  public async get(key: string[] | DBK, defaultValue?: any): Promise<any> {
    return this.db.get(key instanceof DBK ? key.getKey() : key) || defaultValue;
  }

  public async set(key: string[] | DBK, value: any): Promise<void> {
    this.db.set(key instanceof DBK ? key.getKey() : key, value);
  }
}
