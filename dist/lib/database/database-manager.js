"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const fs = require("fs");
const logger_1 = require("../util/logger");
const table_manager_1 = require("./table-manager");
const sql_error_1 = require("./sql-error");
class DatabaseManager {
    constructor(name, logger) {
        this.name = name;
        this.logger = new logger_1.default('database-manager', logger);
        this.tableInfos = {};
        this.tables = {};
    }
    load(directory) {
        return new Promise((resolve, reject) => {
            let errBase = new sql_error_1.default();
            this.database = new sqlite3_1.Database(`${directory}/${this.name}.db`, (err) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve();
            });
        });
    }
    loadFile(file) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync(file))
                return resolve();
            this.logger.log(`Loading database structure from '${file.substring(file.lastIndexOf('/') + 1)}'...`);
            let tables = require(file);
            if (tables.default !== undefined)
                tables = tables.default;
            Object.assign(this.tableInfos, tables);
            let tablesLoaded = 0;
            for (let tableName in tables) {
                let tableInfo = tables[tableName];
                let cols = [];
                if (tableInfo.key != null) {
                    tableInfo.key.unique = true;
                    cols.push(tableInfo.key);
                }
                for (let colName in tableInfo.cols) {
                    cols.push(tableInfo.cols[colName]);
                }
                this.updateTable(tableInfo.name, cols).then(() => __awaiter(this, void 0, void 0, function* () {
                    this.getTable(tableInfo.name).then((table) => __awaiter(this, void 0, void 0, function* () {
                        for (let col of cols) {
                            if (col.unique)
                                yield table.setUnique(col.name).catch(err => { return reject(err); });
                        }
                        this.tables[tableInfo.name] = table;
                        if (++tablesLoaded === Object.keys(tables).length) {
                            this.logger.log('Database successfully loaded.');
                            resolve();
                        }
                    }), reject);
                }), err => { return reject(err); });
            }
        }));
    }
    createTable(name, cols, ifNotExists = false) {
        return new Promise((resolve, reject) => {
            let ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
            let colsStrs = cols.map(c => `${c.name} ${c.type}`);
            this.database.run(`CREATE TABLE${ifNotExistsStr} ${name} (${colsStrs.join()})`, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    reject(err);
                else {
                    this.tables[name] = yield this.getTable(name);
                    resolve();
                }
            }));
        });
    }
    updateTable(name, cols) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.createTable(name, cols, true).catch(err => { return reject(err); });
            let tableInfo = yield this.tableInfo(name);
            let toAdd = cols.filter(c => !tableInfo.map(c2 => c2.name).find(c2 => c2 === c.name));
            let toDrop = tableInfo.filter(c => !cols.map(c2 => c2.name).find(c2 => c2 === c.name));
            if (toAdd.length > 0 || toDrop.length > 0) {
                this.logger.info(`Changes detected in table '${name}'...`);
                let tempName = `temp_${name}`;
                if (yield this.tableExists(tempName).catch(err => { return reject(err); }))
                    yield this.dropTable(tempName);
                yield this.renameTable(name, tempName).catch(err => { return reject(err); });
                yield this.createTable(name, cols).catch(err => { return reject(err); });
                yield new Promise((resolve, reject) => {
                    let colNames = tableInfo.map(c => c.name).filter(c => !toDrop.find(c2 => c2.name === c)).join();
                    let errBase = new sql_error_1.default();
                    console.log(`INSERT INTO ${name} (${colNames}) SELECT ${colNames} FROM ${tempName}`);
                    this.database.run(`INSERT INTO ${name} (${colNames}) SELECT ${colNames} FROM ${tempName}`, (err) => {
                        if (err)
                            reject(errBase.addSQLMsg(new Error(err.message)));
                        else
                            resolve();
                    });
                }).catch(err => { return reject(err); });
                yield this.dropTable(tempName).catch(err => { return reject(err); });
                this.logger.info(`Added ${toAdd.length} and dropped ${toDrop.length} columns from table '${name}'`);
            }
            resolve();
        }));
    }
    tableInfo(name) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.database.all(`pragma table_info('${name}')`, (err, infos) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    reject(err);
                else
                    resolve(infos);
            }));
        }));
    }
    renameTable(name, newName) {
        return new Promise((resolve, reject) => {
            this.database.run(`ALTER TABLE ${name} RENAME TO ${newName}`, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    tableExists(name) {
        return new Promise((resolve, reject) => {
            this.database.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.length > 0);
            });
        });
    }
    dropTable(name) {
        return new Promise((resolve, reject) => {
            this.database.run(`DROP TABLE ${name}`, (err) => {
                if (err)
                    reject(err);
                else {
                    this.tables[name] = undefined;
                    resolve();
                }
            });
        });
    }
    getTable(name) {
        return new Promise((resolve, reject) => {
            this.tableExists(name).then(exists => {
                if (exists)
                    resolve(new table_manager_1.default(this, name));
                else
                    reject(new Error('Table does not exist'));
            });
        });
    }
}
exports.default = DatabaseManager;
