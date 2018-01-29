let { Database } = require('sqlite3')

const fs = require('fs')

class TableManager {
  /**
   * @param {Database} database
   * @param {string} name
   */
  constructor (database, name) {
    this.database = database
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
  insert (cols, vals, replace) {
    return new Promise((resolve, reject) => {
      for (let i in vals) {
        if (typeof (vals[i]) === 'string') vals[i] = `'${vals[i]}'`
      }
      replace = replace ? 'REPLACE' : 'INSERT'
      this.database.run(`${replace} INTO ${this.name} (${cols.join()}) VALUES (${vals.join()})`, (err) => {
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
}

class DatabaseManager {
  /**
   * @typedef Column
   * @prop {string} name
   * @prop {string} type
   */

  /**
   * @param {string} name
   */
  constructor (name) {
    this.name = name
  }

  /**
   * @return {Promise<>}
   */
  load () {
    return new Promise((resolve, reject) => {
      this.database = new Database(`${this.name}.db`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string} file
   * @return {Promise}
   */
  loadFile (file) {
    if (!fs.existsSync(file)) return
    return new Promise(async (resolve, reject) => {
      let tables = require(file)
      for (let tableName in tables) {
        let table = tables[tableName]
        let cols = []
        for (let colName in table.cols) {
          cols.push(table.cols[colName])
        }
        await this.createTable(table.name, cols, true)
        let tablem = await this.getTable(table.name)
        for (let colName in table.cols) {
          if (table.cols[colName].unique) tablem.setUnique(colName)
        }
      }
      resolve()
    })
  }

  /**
   * @param {string} name
   * @param {Column[]} cols
   */
  createTable (name, cols, ifNotExists) {
    return new Promise((resolve, reject) => {
      ifNotExists = ifNotExists == null ? '' : ifNotExists ? ' IF NOT EXISTS' : ''
      let colsStrs = []
      for (let col of cols) colsStrs.push(`${col.name} ${col.type}`)
      this.database.run(`CREATE TABLE${ifNotExists} ${name} (${colsStrs.join()})`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string} name
   * @return {Promise<boolean>}
   */
  tableExists (name) {
    return new Promise((resolve, reject) => {
      this.database.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`, (err, rows) => {
        if (err) reject(err)
        else resolve(rows.length > 0)
      })
    })
  }

  /**
   * @param {string} name
   * @param {Column[]} cols
   * @return {Promise<>}
   */
  deleteTable (name) {
    return new Promise((resolve, reject) => {
      this.database.run(`DROP TABLE ${name}`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string} name
   * @return {Promise<TableManager>}
   */
  getTable (name) {
    return new Promise((resolve, reject) => {
      this.tableExists(name).then(exists => {
        if (exists) resolve(new TableManager(this.database, name))
        else reject(new Error('Table does not exist'))
      })
    })
  }
}

module.exports = DatabaseManager
