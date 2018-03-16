import { Database } from 'sqlite3';
import Logger from '../util/logger';
import TableManager from './table-manager';
import { ColumnInfo } from './column';
export interface Table {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dftl_value: object;
    pk: number;
}
export default class DatabaseManager {
    name: string;
    logger: Logger;
    tableInfos: object;
    tables: object;
    database: Database;
    constructor(name: string, logger?: Logger);
    load(directory: string): Promise<void>;
    loadFile(file: string): Promise<void>;
    createTable(name: string, cols: ColumnInfo[], ifNotExists?: boolean): Promise<void>;
    updateTable(name: string, cols: ColumnInfo[]): Promise<void>;
    tableInfo(name: string): Promise<Table[]>;
    renameTable(name: string, newName: string): Promise<void>;
    tableExists(name: string): Promise<boolean>;
    dropTable(name: string): Promise<void>;
    getTable(name: string): Promise<TableManager>;
}
