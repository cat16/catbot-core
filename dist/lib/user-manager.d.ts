import DatabaseManager from './database/database-manager';
import TableManager from './database/table-manager';
export default class UserManager {
    table: TableManager;
    constructor(dbm: DatabaseManager);
    getUserPermTags(id: string, ignoreNone?: boolean): Promise<string[]>;
    setUserPermTags(id: string, tags: string[]): Promise<void>;
    getAdmin(id: string, ignoreNone?: boolean): Promise<boolean>;
    setAdmin(id: string, admin: boolean): Promise<void>;
}
