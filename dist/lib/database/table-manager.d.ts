import { Database } from 'sqlite3';
import Logger from '../util/logger';
import DatabaseManager from './database-manager';
import { Column } from './column';
export interface TableInfo {
    name: string;
    key?: Column;
    cols: object;
}
export default class TableManager {
    database: Database;
    tableInfo: TableInfo;
    logger: Logger;
    name: string;
    constructor(manager: DatabaseManager, name: string);
    setUnique(col: string): Promise<void>;
    select(cols: string[], condition: string): Promise<any[]>;
    selectAll(): Promise<any>;
    insert(cols: string[], vals: object[], replace?: boolean): Promise<void>;
    delete(condition?: string): Promise<void>;
    get(key: any, colName: string, defaultVal?: any): Promise<any>;
    set(key: any, val: Column): Promise<void>;
    getBoolean(key: any, colName: string, ignoreNone?: boolean): Promise<boolean>;
    setBoolean(key: any, val: Column): Promise<void>;
    getStringArray(key: any, colName: string, ignoreNone?: boolean): Promise<string[]>;
    setStringArray(key: any, val: Column): Promise<void>;
}
