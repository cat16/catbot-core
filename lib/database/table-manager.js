const Logger = require('../util/logger.js')
const DatabaseManager = require('./database-manager.js') // eslint-disable-line no-unused-vars
const { Column } = require('./column.js') // eslint-disable-line no-unused-vars
const SQLError = require('./sql-error.js')

const BOOLEAN_STRING = {
  TRUE: '_BOOLEAN:TRUE',
  FALSE: '_BOOLEAN:FALSE'
}

/**
 * @param {any} value
 * @return {any}
 */
let formatValue = (value) => {
  return typeof (value) === 'string' ? `'${value}'` : value
}

class TableManager {
  /**
   * @typedef TableInfo
   * @prop {string} name
   * @prop {Column} [key]
   * @prop {object} cols
   */

  /**
   * @param {DatabaseManager} manager
   * @param {string} name
   */
  constructor (manager, name) {
    this.database = manager.database
    /** @type {TableInfo} */
    this.tableInfo = manager.tableInfos[name]
    this.logger = new Logger(`table::${name}`, manager.logger)
    this.name = name
  }

  /**
   * @param {string} keyCol
   * @return {Promise<void>}
   */
  setUnique (col) {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database.run(`CREATE UNIQUE INDEX IF NOT EXISTS ${col} ON ${this.name}(${col})`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  /**
   * @param {string[]} cols
   * @param {string} [condition]
   * @return {Promise<any[]>}
   */
  select (cols, condition) {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      let errBase = new SQLError()
      this.database.all(`SELECT (${cols.join()}) FROM ${this.name}${condition}`, (err, rows) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve(rows)
      })
    })
  }

  /**
   * @return {Promise<any[]>}
   */
  selectAll () {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database.all(`SELECT * FROM ${this.name}`, (err, rows) => {
        if (err) reject(errBase.addSQLMsg(new Error(err)))
        else resolve(rows)
      })
    })
  }

  /**
   * @param {string[]} cols
   * @param {object[]} vals
   * @param {boolean} [replace]
   * @return {Promise<void>}
   */
  insert (cols, vals, replace = false) {
    return new Promise((resolve, reject) => {
      for (let i in vals) {
        vals[i] = formatValue(vals[i])
      }
      replace = replace ? 'REPLACE' : 'INSERT'
      let errBase = new SQLError()
      this.database.run(`${replace} INTO ${this.name} (${cols.join()}) VALUES (${vals.join()})`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err)))
        else resolve()
      })
    })
  }

  /**
   * @param {string} [condition]
   * @return {Promise<void>}
   */
  delete (condition) {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      let errBase = new SQLError()
      this.database.run(`DELETE FROM ${this.name}${condition}`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err)))
        else resolve()
      })
    })
  }

  /**
   * @param {any} key
   * @param {string} colName
   * @param {object} [defaultVal]
   * @return {Promise<any>}
   */
  get (key, colName, defaultVal) {
    return new Promise(async (resolve, reject) => {
      defaultVal = defaultVal == null ? null : defaultVal
      let rows = await this.select([colName], `${this.tableInfo.key.name} = ${formatValue(key)}`).catch(err => { return reject(err) })
      if (rows == null || rows.length < 1) {
        resolve(defaultVal)
      } else {
        let data = rows[0][colName]
        if (data === BOOLEAN_STRING.TRUE) data = true
        if (data === BOOLEAN_STRING.FALSE) data = false
        resolve(data == null ? defaultVal : data)
      }
    })
  }

  /**
   * @param {any} key
   * @param {Column} val
   * @param {string[]} cols
   * @return {Promise<void>}
   */
  set (key, val) {
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
        if (err) reject(errBase.addSQLMsg(new Error(err)))
        else resolve()
      })
    })
  }

  /**
   * @param {any} key
   * @param {string} colName
   * @param {boolean} [ignoreNone]
   * @return {Promise<boolean>}
   */
  getBoolean (key, colName, ignoreNone = false) {
    return new Promise(async (resolve, reject) => {
      let bool = await this.get(key, colName).catch(err => { return reject(err) })
      resolve(bool === 0 || bool == null ? (ignoreNone ? false : null) : bool === 2)
    })
  }

  /**
   * @param {any} key
   * @param {Column} val
   * @param {string[]} cols
   * @return {Promise<void>}
   */
  setBoolean (key, val) {
    return this.set(
      key,
      {
        name: val.name,
        value: val.value == null ? 0 : val.value ? 2 : 1
      }
    )
  }

  /**
   * @param {any} key
   * @param {string} colName
   * @param {boolean} [ignoreNone]
   * @return {Promise<string[]>}
   */
  getStringArray (key, colName, ignoreNone = false) {
    return new Promise(async (resolve, reject) => {
      let arrStr = await this.get(key, colName, ignoreNone ? '' : null).catch(err => { return reject(err) })
      if (arrStr == null) resolve(arrStr)
      else if (arrStr === '') resolve([])
      else resolve(arrStr.split(','))
    })
  }

  /**
   * @param {any} key
   * @param {Column} val
   * @return {Promise<void>}
   */
  setStringArray (key, val) {
    return this.set(
      key,
      {
        name: val.name,
        value: val.value.join(', ')
      }
    )
  }
}

module.exports = TableManager
