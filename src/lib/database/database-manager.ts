import { Database } from 'sqlite3'

import * as fs from 'fs'

import Logger from '../util/logger'
import TableManager from './table-manager'
import { ColumnInfo } from './column'
import SQLError from './sql-error'

export interface Table {
  cid: number
  name: string
  type: string
  notnull: number
  dftl_value: object
  pk: number
}

export default class DatabaseManager {

  name: string
  logger: Logger
  tableInfos: object
  tables: object
  database: Database

  constructor (name: string, logger?: Logger) {
    this.name = name
    this.logger = new Logger('database-manager', logger)
    this.tableInfos = {}
    this.tables = {}
  }

  load (directory: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let errBase = new SQLError()
      this.database = new Database(`${directory}/${this.name}.db`, (err) => {
        if (err) reject(errBase.addSQLMsg(new Error(err.message)))
        else resolve()
      })
    })
  }

  loadFile (file: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!fs.existsSync(file)) return resolve()
      this.logger.log(`Loading database structure from '${file.substring(file.lastIndexOf('/') + 1)}'...`)
      let tables = require(file)
      if(tables.default !== undefined) tables = tables.default
      Object.assign(this.tableInfos, tables)
      let tablesLoaded = 0
      for (let tableName in tables) {
        let tableInfo = tables[tableName]
        let cols: ColumnInfo[] = []
        if (tableInfo.key != null) {
          tableInfo.key.unique = true
          cols.push(tableInfo.key)
        }
        for (let colName in tableInfo.cols) {
          cols.push(tableInfo.cols[colName])
        }
        this.updateTable(tableInfo.name, cols).then(async () => {
          this.getTable(tableInfo.name).then(async table => {
            for (let col of cols) {
              if (col.unique) await table.setUnique(col.name).catch(err => { return reject(err) })
            }
            this.tables[tableInfo.name] = table
            if (++tablesLoaded === Object.keys(tables).length) {
              this.logger.log('Database successfully loaded.')
              resolve()
            }
          }, reject)
        }, err => { return reject(err) })
      }
    })
  }

  createTable (name: string, cols: ColumnInfo[], ifNotExists: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      let ifNotExistsStr: string = ifNotExists ? ' IF NOT EXISTS' : ''
      let colsStrs = cols.map(c => `${c.name} ${c.type}`)
      this.database.run(`CREATE TABLE${ifNotExistsStr} ${name} (${colsStrs.join()})`, async (err) => {
        if (err) reject(err)
        else {
          this.tables[name] = await this.getTable(name)
          resolve()
        }
      })
    })
  }

  updateTable (name: string, cols: ColumnInfo[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.createTable(name, cols, true).catch(err => { return reject(err) })
      let tableInfo = await this.tableInfo(name)
      let toAdd = cols.filter(c => !tableInfo.map(c2 => c2.name).find(c2 => c2 === c.name))
      let toDrop = tableInfo.filter(c => !cols.map(c2 => c2.name).find(c2 => c2 === c.name))
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
            if (err) reject(errBase.addSQLMsg(new Error(err.message)))
            else resolve()
          })
        }).catch(err => { return reject(err) })
        await this.dropTable(tempName).catch(err => { return reject(err) })
        this.logger.info(`Added ${toAdd.length} and dropped ${toDrop.length} columns from table '${name}'`)
      }
      resolve()
    })
  }

  tableInfo (name: string): Promise<Table[]> {
    return new Promise(async (resolve, reject) => {
      this.database.all(`pragma table_info('${name}')`, async (err, infos) => {
        if (err) reject(err)
        else resolve(infos)
      })
    })
  }

  renameTable (name: string, newName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.run(`ALTER TABLE ${name} RENAME TO ${newName}`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  tableExists (name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.database.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`, (err, rows) => {
        if (err) reject(err)
        else resolve(rows.length > 0)
      })
    })
  }

  dropTable (name: string): Promise<void> {
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

  getTable (name: string): Promise<TableManager> {
    return new Promise((resolve, reject) => {
      this.tableExists(name).then(exists => {
        if (exists) resolve(new TableManager(this, name))
        else reject(new Error('Table does not exist'))
      })
    })
  }
}
