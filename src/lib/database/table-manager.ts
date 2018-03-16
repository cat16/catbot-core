import { Database } from 'sqlite3'
import Logger from '../util/logger'
import DatabaseManager from './database-manager'
import { Column } from './column'
import SQLError from './sql-error'

enum BOOLEAN_STRING {
  TRUE = '_BOOLEAN:TRUE',
  FALSE = '_BOOLEAN:FALSE'
}

/**
 * @param {any} value
 * @return {any}
 */
let formatValue = (value) => {
  return typeof (value) === 'string' ? `'${value}'` : value
}

export interface TableInfo {
  name: string
  key?: Column
  cols: object
}

export default class TableManager {

  database: Database
  tableInfo: TableInfo
  logger: Logger
  name: string

  constructor(manager: DatabaseManager, name: string) {
    this.database = manager.database
    this.tableInfo = manager.tableInfos[name]
    this.logger = new Logger(`table::${name}`, manager.logger)
    this.name = name
  }

  setUnique(col: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database.run(`CREATE UNIQUE INDEX IF NOT EXISTS ${col} ON ${this.name}(${col})`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  select(cols: string[], condition: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      let errBase = new SQLError()
      this.database.all(`SELECT (${cols.join()}) FROM ${this.name}${condition}`, (err, rows) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve(rows)
      })
    })
  }

  selectAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database.all(`SELECT * FROM ${this.name}`, (err, rows) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve(rows)
      })
    })
  }

  insert(cols: string[], vals: object[], replace: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      for (let i in vals) {
        vals[i] = formatValue(vals[i])
      }
      let replaceStr = replace ? 'REPLACE' : 'INSERT'
      let errBase = new SQLError()
      this.database.run(`${replaceStr} INTO ${this.name} (${cols.join()}) VALUES (${vals.join()})`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  delete(condition?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      let errBase = new SQLError()
      this.database.run(`DELETE FROM ${this.name}${condition}`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  get(key: any, colName: string, defaultVal?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      defaultVal = defaultVal == null ? null : defaultVal
      this.select([colName], `${this.tableInfo.key.name} = ${formatValue(key)}`).then(rows => {
        if (rows == null || rows.length < 1) {
          resolve(defaultVal)
        } else {
          let data = rows[0][colName]
          if (data === BOOLEAN_STRING.TRUE) data = true
          if (data === BOOLEAN_STRING.FALSE) data = false
          resolve(data == null ? defaultVal : data)
        }
      }, reject)
    })
  }

  set(key: any, val: Column): Promise<void> {
    return new Promise((resolve, reject) => {
      key = { name: this.tableInfo.key.name, value: formatValue(key) }
      val.value = formatValue(val.value)
      if (val.value === true) val.value = BOOLEAN_STRING.TRUE
      if (val.value === false) val.value = BOOLEAN_STRING.FALSE
      let cols = [key.name, val.name]
      for (let i in this.tableInfo.cols) {
        let info = this.tableInfo.cols[i]
        if (info.name !== key.name && info.name !== val.name) cols.push(info.name)
      }
      let vals = []
      cols.forEach(c => {
        if (c !== key.name && c !== val.name) vals.push(`(SELECT ${c} FROM ${this.name} WHERE ${key.name} = ${key.value})`)
      })
      let errBase = new SQLError()
      this.database.run(`INSERT OR REPLACE INTO ${this.name} (${cols.join()}) VALUES (${[key.value, val.value].concat(vals).join(', ')})`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  getBoolean(key: any, colName: string, ignoreNone: boolean = false): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.get(key, colName).then(bool => {
        resolve(bool === 0 || bool == null ? (ignoreNone ? false : null) : bool === 2)
      }, reject)
    })
  }

  setBoolean(key: any, val: Column): Promise<void> {
    return this.set(
      key,
      {
        name: val.name,
        value: val.value == null ? 0 : val.value ? 2 : 1
      }
    )
  }

  getStringArray(key: any, colName: string, ignoreNone: boolean = false): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.get(key, colName, ignoreNone ? '' : null).then(arrStr => {
        if (arrStr == null) resolve(arrStr)
        else if (arrStr === '') resolve([])
        else resolve(arrStr.split(','))
      }, reject)
    })
  }

  setStringArray(key: any, val: Column): Promise<void> {
    return this.set(
      key,
      {
        name: val.name,
        value: val.value.join(', ')
      }
    )
  }
}
