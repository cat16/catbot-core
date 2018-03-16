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
const logger_1 = require("../util/logger");
const sql_error_1 = require("./sql-error");
var BOOLEAN_STRING;
(function (BOOLEAN_STRING) {
    BOOLEAN_STRING["TRUE"] = "_BOOLEAN:TRUE";
    BOOLEAN_STRING["FALSE"] = "_BOOLEAN:FALSE";
})(BOOLEAN_STRING || (BOOLEAN_STRING = {}));
/**
 * @param {any} value
 * @return {any}
 */
let formatValue = (value) => {
    return typeof (value) === 'string' ? `'${value}'` : value;
};
class TableManager {
    constructor(manager, name) {
        this.database = manager.database;
        this.tableInfo = manager.tableInfos[name];
        this.logger = new logger_1.default(`table::${name}`, manager.logger);
        this.name = name;
    }
    setUnique(col) {
        return new Promise((resolve, reject) => {
            let errBase = new sql_error_1.default();
            this.database.run(`CREATE UNIQUE INDEX IF NOT EXISTS ${col} ON ${this.name}(${col})`, (err) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve();
            });
        });
    }
    select(cols, condition) {
        return new Promise((resolve, reject) => {
            condition = condition == null ? '' : ` WHERE ${condition}`;
            let errBase = new sql_error_1.default();
            this.database.all(`SELECT (${cols.join()}) FROM ${this.name}${condition}`, (err, rows) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve(rows);
            });
        });
    }
    selectAll() {
        return new Promise((resolve, reject) => {
            let errBase = new sql_error_1.default();
            this.database.all(`SELECT * FROM ${this.name}`, (err, rows) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve(rows);
            });
        });
    }
    insert(cols, vals, replace = false) {
        return new Promise((resolve, reject) => {
            for (let i in vals) {
                vals[i] = formatValue(vals[i]);
            }
            let replaceStr = replace ? 'REPLACE' : 'INSERT';
            let errBase = new sql_error_1.default();
            this.database.run(`${replaceStr} INTO ${this.name} (${cols.join()}) VALUES (${vals.join()})`, (err) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve();
            });
        });
    }
    delete(condition) {
        return new Promise((resolve, reject) => {
            condition = condition == null ? '' : ` WHERE ${condition}`;
            let errBase = new sql_error_1.default();
            this.database.run(`DELETE FROM ${this.name}${condition}`, (err) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve();
            });
        });
    }
    get(key, colName, defaultVal) {
        return new Promise((resolve, reject) => {
            defaultVal = defaultVal == null ? null : defaultVal;
            this.select([colName], `${this.tableInfo.key.name} = ${formatValue(key)}`).then(rows => {
                if (rows == null || rows.length < 1) {
                    resolve(defaultVal);
                }
                else {
                    let data = rows[0][colName];
                    if (data === BOOLEAN_STRING.TRUE)
                        data = true;
                    if (data === BOOLEAN_STRING.FALSE)
                        data = false;
                    resolve(data == null ? defaultVal : data);
                }
            }, reject);
        });
    }
    set(key, val) {
        return new Promise((resolve, reject) => {
            key = { name: this.tableInfo.key.name, value: formatValue(key) };
            val.value = formatValue(val.value);
            if (val.value === true)
                val.value = BOOLEAN_STRING.TRUE;
            if (val.value === false)
                val.value = BOOLEAN_STRING.FALSE;
            let cols = [key.name, val.name];
            for (let i in this.tableInfo.cols) {
                let info = this.tableInfo.cols[i];
                if (info.name !== key.name && info.name !== val.name)
                    cols.push(info.name);
            }
            let vals = [];
            cols.forEach(c => {
                if (c !== key.name && c !== val.name)
                    vals.push(`(SELECT ${c} FROM ${this.name} WHERE ${key.name} = ${key.value})`);
            });
            let errBase = new sql_error_1.default();
            this.database.run(`INSERT OR REPLACE INTO ${this.name} (${cols.join()}) VALUES (${[key.value, val.value].concat(vals).join(', ')})`, (err) => {
                if (err)
                    reject(errBase.addSQLMsg(new Error(err.message)));
                else
                    resolve();
            });
        });
    }
    getBoolean(key, colName, ignoreNone = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.get(key, colName).then(bool => {
                resolve(bool === 0 || bool == null ? (ignoreNone ? false : null) : bool === 2);
            }, reject);
        }));
    }
    setBoolean(key, val) {
        return this.set(key, {
            name: val.name,
            value: val.value == null ? 0 : val.value ? 2 : 1
        });
    }
    getStringArray(key, colName, ignoreNone = false) {
        return new Promise((resolve, reject) => {
            this.get(key, colName, ignoreNone ? '' : null).then(arrStr => {
                if (arrStr == null)
                    resolve(arrStr);
                else if (arrStr === '')
                    resolve([]);
                else
                    resolve(arrStr.split(','));
            }, reject);
        });
    }
    setStringArray(key, val) {
        return this.set(key, {
            name: val.name,
            value: val.value.join(', ')
        });
    }
}
exports.default = TableManager;
