import { MongoClient, Db } from 'mongodb'

import Logger from '../util/logger'

export interface ConnectionOptions {
  uri: string,
  user?: string,
  password?: string
}

export default class DatabaseManager {

  private logger: Logger
  private client: MongoClient

  constructor(options: ConnectionOptions, logger?: Logger) {
    this.client = new MongoClient(options.uri, {
      auth: {
        user: options.user,
        password: options.password
      }
    })
    this.logger = new Logger('database-manager', logger)
  }

  connect(): Promise<DatabaseManager> {
    return new Promise<DatabaseManager>((resolve, reject) => {
      this.client.connect((err, client) => {
        if(err) reject(err)
        resolve(this)
      })
    })
  }
  
  getDatabase(name: string): Db {
    return this.client.db(name)
  }

  deleteDatabase(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      return this.getDatabase(name).dropDatabase()
    })
  }
}