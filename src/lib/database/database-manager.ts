import { MongoClient } from 'mongodb'

import Logger from '../util/logger'

export interface ConnectionOptions {
  uri: string,
  user?: string,
  password?: string
}

export default class DatabaseManager extends MongoClient {

  private connectionInfo: ConnectionOptions
  private logger: Logger

  constructor(options: ConnectionOptions, logger?: Logger) {
    super(options.uri, {
      auth: {
        user: options.user,
        password: options.password
      }
    })
    this.logger = new Logger('database-manager', logger)
    this.connectionInfo = options
  }

  connect(): Promise<DatabaseManager> {
    return new Promise<DatabaseManager>((resolve, reject) => {
      super.connect((err, client) => {
        if(err) reject(err)
        else {
          this.logger.success(`Successfully connected to ${this.connectionInfo.uri} as ${this.connectionInfo.user}`)
          resolve(this)
        }
      })
    })
  }
}