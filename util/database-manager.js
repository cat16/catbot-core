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
      this.logger.log(`Loading database structure from '${file.substring(file.lastIndexOf('/') + 1)}'...`)
      let tables = require(file)
      for (let tableName in tables) {
        let table = tables[tableName]
        let cols = []
        for (let colName in table.cols) {
          cols.push(table.cols[colName])
        }
        await this.updateTable(table.name, cols)
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
   * @param {boolean} ifNotExists
   * @return {Promise}
   */
  createTable (name, cols, ifNotExists) {
    return new Promise((resolve, reject) => {
      ifNotExists = ifNotExists == null ? '' : ifNotExists ? ' IF NOT EXISTS' : ''
      let colsStrs = cols.map(c => `${c.name} ${c.type}`)
      this.database.run(`CREATE TABLE${ifNotExists} ${name} (${colsStrs.join()})`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * @param {string} name
   * @param {Column[]} cols
   * @return {Promise}
   */
  updateTable (name, cols) {
    return new Promise(async (resolve, reject) => {
      this.createTable(name, cols, true)
      let tableInfo = await this.tableInfo(name).catch(err => { reject(err) })
      let toAdd = cols.filter(c => !tableInfo.map(c2 => c2.name).includes(c.name))
      let toDrop = tableInfo.filter(c => !cols.map(c2 => c2.name).includes(c.name))
      if (toAdd.length > 0 || toDrop.length > 0) {
        let tempName = `temp_${name}`
        if (await this.tableExists(tempName).catch(err => { reject(err) })) await this.dropTable(tempName)
        await this.renameTable(name, tempName).catch(err => { reject(err) })
        await this.createTable(name, cols).catch(err => { reject(err) })
        console.log(`INSERT INTO ${name} (${cols.map(c => `${c.name} ${c.type}`).join()}) SELECT ${cols.map(c => c.name).join()} FROM ${tempName}`)
        await new Promise((resolve, reject) => {
          let colNames = tableInfo.map(c => c.name).filter(c => !toDrop.find(c2 => c2.name === c)).join()
          this.database.run(`INSERT INTO ${name} (${colNames}) SELECT ${colNames} FROM ${tempName}`, (err) => {
            if (err) reject(err)
            else resolve()
          })
        }).catch(err => { reject(err) })
        await this.dropTable(tempName).catch(err => { reject(err) })
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
   * @return {Promise}
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
   * @return {Promise<>}
   */
  dropTable (name) {
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
