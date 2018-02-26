const Logger = require('./logger.js')
const DatabaseManager = require('./database-manager.js') // eslint-disable-line no-unused-vars

/**
 * @param {any} value
 * @return {any}
 */
let formatValue = (value) => {
  return typeof (value) === 'string' ? `'${value}'` : value
}

class TableManager {
  /**
   * @typedef Column
   * @prop {string} name
   * @prop {any} value
   */

  /**
   * @param {DatabaseManager} manager
   * @param {string} name
   */
  constructor (manager, name) {
    this.database = manager.database
    this.logger = new Logger(`table::${name}`, manager.logger)
    this.name = name
  }

  /**
   * @param {string} keyCol
   * @return {Promise}
   */
  setUnique (col) {
    return new Promise((resolve, reject) => {
      this.database.run(`CREATE UNIQUE INDEX IF NOT EXISTS ${col} ON ${this.name}(${col})`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string[]} cols
   * @param {string} [condition]
   * @return {Promise<object[]>}
   */
  select (cols, condition) {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      this.database.all(`SELECT (${cols.join()}) FROM ${this.name}${condition}`, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  /**
   * @return {Promise<object[]>}
   */
  selectAll () {
    return new Promise((resolve, reject) => {
      this.database.all(`SELECT * FROM ${this.name}`, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  /**
   * @param {string[]} cols
   * @param {object[]} vals
   * @param {boolean} [replace]
   * @return {Promise}
   */
  insert (cols, vals, replace = false) {
    return new Promise((resolve, reject) => {
      for (let i in vals) {
        vals[i] = formatValue(vals[i])
      }
      replace = replace ? 'REPLACE' : 'INSERT'
      this.database.run(`${replace} INTO ${this.name} (${cols.join()}) VALUES (${vals.join()})`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {Column} key
   * @param {Column} val
   * @param {string[]} cols
   * @return {Promise}
   */
  update (key, val, colInfo) {
    return new Promise((resolve, reject) => {
      val.value = formatValue(val.value)
      key.value = formatValue(key.value)
      let cols = [key.name, val.name]
      for (let i in colInfo) {
        let info = colInfo[i]
        if (info.name !== key.name && info.name !== val.name) cols.push(info.name)
      }
      let vals = []
      cols.forEach(c => {
        if (c !== key.name && c !== val.name) vals.push(`(SELECT ${c} FROM ${this.name} WHERE ${key.name} = ${key.value})`)
      })
      this.database.run(`INSERT OR REPLACE INTO ${this.name} (${cols.join()}) VALUES (${key.value}, ${val.value}, ${vals.join()})`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string} [condition]
   * @return {Promise}
   */
  delete (condition) {
    return new Promise((resolve, reject) => {
      condition = condition == null ? '' : ` WHERE ${condition}`
      this.database.run(`DELETE FROM ${this.name}${condition}`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {Column} key
   * @param {string} colName
   * @param {object} [defaultVal]
   * @return {Promise<object>}
   */
  get (key, colName, defaultVal) {
    return new Promise(async (resolve, reject) => {
      defaultVal = defaultVal == null ? null : defaultVal
      let rows = await this.select([colName], `${key.name} = ${formatValue(key.value)}`)
      if (rows == null || rows.length < 1) {
        resolve(defaultVal)
      } else {
        let data = rows[0][colName]
        resolve(data == null ? defaultVal : data)
      }
    })
  }

  /**
   * @param {Column} key
   * @param {string} colName
   * @param {boolean} [ignoreNone]
   * @return {Promise<boolean>}
   */
  getBoolean (key, colName, ignoreNone = false) {
    return new Promise(async (resolve, reject) => {
      let bool = await this.get(key, colName)
      resolve(bool === 0 || bool == null ? (ignoreNone ? false : null) : bool === 2)
    })
  }

  /**
   * @param {Column} key
   * @param {Column} val
   * @param {string[]} cols
   * @return {Promise}
   */
  setBoolean (key, val, colInfo) {
    return this.update(
      key,
      { name: val.name, value: val.value == null ? 0 : val.value ? 2 : 1 },
      colInfo
    )
  }

  /**
   * @param {Column} key
   * @param {string} colName
   * @param {boolean} [ignoreNone]
   * @return {Promise<string[]>}
   */
  getStringArray (key, colName, ignoreNone = false) {
    return new Promise(async (resolve, reject) => {
      let arrStr = await this.get(key, colName, ignoreNone ? '' : null)
      if (arrStr == null) resolve(arrStr)
      else if (arrStr === '') resolve([])
      else resolve(arrStr.split(','))
    })
  }
}

module.exports = TableManager
