let { Database } = require('sqlite3')

const fs = require('fs')

const Logger = require('../util/logger.js')
const TableManager = require('./table-manager.js')
const { ColumnInfo } = require('./column.js') // eslint-disable-line no-unused-vars
const SQLError = require('./sql-error.js')

class DatabaseManager {
  /**
   * @typedef Table
   * @prop {number} cid
   * @prop {string} name
   * @prop {string} type
   * @prop {number} notnull
   * @prop {object} dflt_value
   * @prop {number} pk
   */

  /**
   * @param {string} name
   * @param {Logger} [logger]
   */
  constructor (name, logger) {
    this.name = name
    this.logger = new Logger('database-manager', logger)
    this.tableInfos = {}
    this.tables = {}
  }

  /**
   * @param {string} directory
   * @return {Promise<void>}
   */
  load (directory) {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database = new Database(`${directory}/${this.name}.db`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err)))
        else resolve()
      })
    })
  }

  /**
   * @param {string} file
   * @return {Promise<void>}
   */
  loadFile (file) {
    return new Promise(async (resolve, reject) => {
      if (!fs.existsSync(file)) return resolve()
      this.logger.log(`Loading database structure from '${file.substring(file.lastIndexOf('/') + 1)}'...`)
      let tables = require(file)
      Object.assign(this.tableInfos, tables)
      let tablesLoaded = 0
      for (let tableName in tables) {
        let tableInfo = tables[tableName]
        /** @type {ColumnInfo[]} */
        let cols = []
        if (tableInfo.key != null) {
          tableInfo.key.unique = true
          cols.push(tableInfo.key)
        }
        for (let colName in tableInfo.cols) {
          cols.push(tableInfo.cols[colName])
        }
        this.updateTable(tableInfo.name, cols).then(async () => {
          let table = await this.getTable(tableInfo.name).catch(err => { return reject(err) })
          for (let col of cols) {
            if (col.unique) await table.setUnique(col.name).catch(err => { return reject(err) })
          }
          this.tables[tableInfo.name] = table
          if (++tablesLoaded === Object.keys(tables).length) {
            this.logger.log('Database successfully loaded.')
            resolve()
          }
        }, err => { return reject(err) })
      }
    })
  }

  /**
   * @param {string} name
   * @param {ColumnInfo[]} cols
   * @param {boolean} ifNotExists
   * @return {Promise<void>}
   */
  createTable (name, cols, ifNotExists) {
    return new Promise((resolve, reject) => {
      ifNotExists = ifNotExists == null ? '' : ifNotExists ? ' IF NOT EXISTS' : ''
      let colsStrs = cols.map(c => `${c.name} ${c.type}`)
      this.database.run(`CREATE TABLE${ifNotExists} ${name} (${colsStrs.join()})`, async (err) => {
        if (err) reject(err)
        else {
          this.tables[name] = await this.getTable(name)
          resolve()
        }
      })
    })
  }

  /**
   * @param {string} name
   * @param {ColumnInfo[]} cols
   * @return {Promise<void>}
   */
  updateTable (name, cols) {
    return new Promise(async (resolve, reject) => {
      this.createTable(name, cols, true).catch(err => { return reject(err) })
      let tableInfo = await this.tableInfo(name).catch(err => { return reject(err) })
      let toAdd = cols.filter(c => !tableInfo.map(c2 => c2.name).includes(c.name))
      let toDrop = tableInfo.filter(c => !cols.map(c2 => c2.name).includes(c.name))
      if (toAdd.length > 0 || toDrop.length > 0) {
        this.logger.info(`Changes detected in table '${name}'...`)
        let tempName = `temp_${name}`
        if (await this.tableExists(tempName).catch(err => { return reject(err) })) await this.dropTable(tempName)
        await this.renameTable(name, tempName).catch(err => { return reject(err) })
        await this.createTable(name, cols).catch(err => { return reject(err) })
        await new Promise((resolve, reject) => {
          let colNames = tableInfo.map(c => c.name).filter(c => !toDrop.find(c2 => c2.name === c)).join()
          let errBase = new SQLError()
          console.log(`INSERT INTO ${name} (${colNames}) SELECT ${colNames} FROM ${tempName}`)
          this.database.run(`INSERT INTO ${name} (${colNames}) SELECT ${colNames} FROM ${tempName}`, (err) => {
            if (err) reject(errBase.addSQLMsg(new Error(err)))
            else resolve()
          })
        }).catch(err => { return reject(err) })
        await this.dropTable(tempName).catch(err => { return reject(err) })
        this.logger.info(`Added ${toAdd.length} and dropped ${toDrop.length} columns from table '${name}'`)
      }
      resolve()
    })
  }

  /**
   * @param {string} name
   * @return {Promise<Table[]>}
   */
  tableInfo (name) {
    return new Promise(async (resolve, reject) => {
      this.database.all(`pragma table_info('${name}')`, async (err, infos) => {
        if (err) reject(err)
        else resolve(infos)
      })
    })
  }

  /**
   * @param {string} name
   * @param {string} newName
   * @return {Promise<void>}
   */
  renameTable (name, newName) {
    return new Promise((resolve, reject) => {
      this.database.run(`ALTER TABLE ${name} RENAME TO ${newName}`, (err) => {
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
   * @return {Promise<void>}
   */
  dropTable (name) {
    return new Promise((resolve, reject) => {
      this.database.run(`DROP TABLE ${name}`, (err) => {
        if (err) reject(err)
        else {
          this.tables[name] = undefined
          resolve()
        }
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
