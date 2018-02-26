let { Database } = require('sqlite3')

const fs = require('fs')

const Logger = require('./logger.js')
const TableManager = require('./table-manager.js')

class DatabaseManager {
  /**
   * @typedef Column
   * @prop {string} name
   * @prop {string} type
   */

  /**
   * @param {string} name
   * @param {Logger} [logger]
   */
  constructor (name, logger) {
    this.name = name
    this.logger = new Logger('database-manager', logger)
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
          if (table.cols[colName].unique) await tablem.setUnique(colName)
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
        if (exists) resolve(new TableManager(this, name))
        else reject(new Error('Table does not exist'))
      })
    })
  }
}

module.exports = DatabaseManager
