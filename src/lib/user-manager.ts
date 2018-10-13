import DatabaseManager from "./database/database-manager";
import TableManager from "./database/table-manager";
import TABLES from "./default-modules/core/database";
const UTI = TABLES.users;
const UTIcols = UTI.cols;

export default class UserManager {

  public table: TableManager;

  constructor(dbm: DatabaseManager) {
    this.table = dbm.tables[UTI.name];
  }

  public getUserPermTags(id: string, ignoreNone: boolean = false): Promise<string[]> {
    return this.table.getStringArray(
      id, UTIcols.permTags.name, ignoreNone,
    );
  }

  public setUserPermTags(id: string, tags: string[]): Promise<void> {
    return this.table.setStringArray(
      id,
      {
        name: UTIcols.permTags.name,
        value: tags,
      },
    );
  }

  public getAdmin(id: string, ignoreNone: boolean = false): Promise<boolean> {
    return this.table.getBoolean(
      id, UTIcols.admin.name, ignoreNone,
    );
  }

  public setAdmin(id: string, admin: boolean): Promise<void> {
    return this.table.setBoolean(
      id,
      {
        name: UTIcols.admin.name,
        value: admin,
      },
    );
  }
}
