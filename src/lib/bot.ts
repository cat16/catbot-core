import { Client } from 'eris'
import * as fs from 'fs'

import Logger from './util/logger'
import DatabaseClient, { ConnectionOptions } from './database/database-manager'
import Config from './config'
import { CommandManager } from './module/command/command-manager'
import { ModuleManager, ModuleLoader } from './module/module-manager'
import Module from './module/module'
import { EventManager } from './module/event/event-manager'
import BotUtil, { pathExists, createDirectory, getInput } from './util/util'
import { Db } from '../../node_modules/@types/mongodb'

export default class Bot {

  private directory: string
  private logger: Logger
  private util: BotUtil
  private databaseClient: DatabaseClient
  private moduleManager: ModuleManager
  private commandManager: CommandManager
  private eventManager: EventManager
  private client: Client
  private config: Config

  constructor(directory: string) {
    this.directory = directory
    this.logger = new Logger('bot-core')
    this.util = new BotUtil(this)
    this.databaseClient = null
    this.moduleManager = new ModuleManager(this)
    this.client = new Client(this.config.token, {})
    this.config = null
  }

  onrestart(bot: Bot, err?: Error) { }

  load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger('bot-core')
      this.logger.log('Loading...')
      this.util = new BotUtil(this)
      this.loadConfig('config.json')
      this.databaseClient = new DatabaseClient({
        uri: this.config.dbURI,
        user: this.config.dbUser,
        password: this.config.dbPassword
      }, this.logger)
      if (!pathExists(this.directory)) createDirectory(this.directory)
      this.moduleManager.loadDirectory(`${__dirname}/default-modules`)
      this.moduleManager.addLoader(new ModuleLoader(this.directory, this))
      this.logger.success('Successfully loaded.')
      resolve()
    })
  }

  getModule(name: string): Module {
    return this.moduleManager.find(name).data.element
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log('Connecting...')
      this.client.on('ready', () => {
        this.logger.success('Successfully connected.')
        resolve()
      })
      this.client.connect()
    })
  }

  async loadConfig(file: string): Promise<void> {
    let writeConfig = (config) => {
      fs.writeFileSync(`${this.directory}/${file}`, JSON.stringify(config, null, '\t'))
    }

    if (fs.existsSync(`${this.directory}/${file}`)) {
      let config = require(`${this.directory}/${file}`)
      let updated = false
      let neededConfig = new Config()
      for (let key in neededConfig) {
        if (config[key] == null && neededConfig[key] === undefined) {
          if (!updated) this.logger.warn(`Config is not completed! Please fill in the following values...`)
          process.stdout.write(this.logger.getLogString(key))
          config[key] = await getInput()
          updated = true
        }
      }
      if (updated) {
        writeConfig(config)
        this.logger.success('Config file updated.')
      }
      this.config = config
    } else {
      this.logger.warn('No config file detected!\nCreating new config file...')
      let config = new Config()
      for (let key in config) {
        process.stdout.write(this.logger.getLogString(`Enter ${key}: `))
        if (config[key] == null) config[key] = await getInput()
      }
      writeConfig(config)
      this.logger.success('Config file generated')
      this.config = config
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info('Starting bot...')
      this.load().then(() => {
        this.connect().then(resolve, reject)
      }, reject)
    })
  }

  //replace with an exit, dummy, and find a way to make stop actually stop it
  restart(reloadFiles: boolean = false): Promise<Bot> {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Restarting...')
      this.client.disconnect({ reconnect: false })
      if (reloadFiles) {
        Object.keys(require.cache).forEach(function (key) { if (!key.includes('node_modules')) delete require.cache[key] })
        let NewCatbot = require(__filename).default
        let bot = new NewCatbot(this.directory)
        bot.start().then(() => {
          this.onrestart(bot)
          resolve(bot)
        }, err => {
          this.onrestart(bot, err)
          reject(err)
        })
      } else {
        this.start().then(resolve.bind(null, this), reject.bind(null, this))
      }
    })
  }

  stop() {
    this.logger.info('Stopping...')
    this.client.disconnect({ reconnect: false })
  }

  getCommandManager(): CommandManager {
    return this.commandManager
  }

  getEventManager(): EventManager {
    return this.eventManager
  }

  getLogger(): Logger {
    return this.logger
  }

  getUtil(): BotUtil {
    return this.util
  }

  getDBManager(): DatabaseClient {
    return this.databaseClient
  }

  db(): Db {
    return this.databaseClient.db('bot')
  }

  getClient() {
    return this.client
  }

  getConfig() {
    return this.config
  }
}
