const eris = require('eris')
const { Client } = eris // eslint-disable-line no-unused-vars

const fs = require('fs')
const readline = require('readline-sync')

let Logger = require('./util/logger.js')
let load = require('./util/load.js')
let DatabaseManager = require('./database/database-manager.js')
let TableManager = require('./database/table-manager.js') // eslint-disable-line no-unused-vars
let Config = require('./config.js')
let CommandManager = require('./command/command-manager.js')
let UserManager = require('./user-manager.js')
let Util = require('./util/util.js')

const BTI = require('./default/database.js').bot

class Catbot {
  /**
   * @param {String} directory
   */
  constructor (directory) {
    /** @type {string} */
    this.directory = directory
    /** @type {Logger} */
    this.logger = null
    /** @type {Util} */
    this.util = null
    /** @type {DatabaseManager} */
    this.databaseManager = null
    /** @type {CommandManager} */
    this.commandManager = null
    /** @type {TableManager} */
    this.table = null
    /** @type {UserManager} */
    this.userManager = null
    /** @type {Client} */
    this.client = null
    /** @type {Config} */
    this.config = null
    /**
     * @param {Catbot} bot
     * @param {Error} [err]
     */
    this.onrestart = (bot, err) => { }
    this.temp = {}
  }

  /**
   * @return {Promise<void>}
   */
  load () {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger('bot-core')
      this.logger.log('Loading...')
      this.util = new Util(this)
      this.loadConfig('config.json')
      this.databaseManager = new DatabaseManager('storage', this.logger)
      this.commandManager = new CommandManager(this)
      this.client = new eris.Client(this.config.token, {})
      // load database
      await this.databaseManager.load(this.directory).catch(err => { return reject(err) })
      await this.util.multiPromise([
        this.registerDir(`${__dirname}/default`, false, true).catch(err => { return reject(err) }),
        this.registerDir(this.directory, this.config.generateFolders, false).catch(err => { return reject(err) })
      ])
      this.table = this.databaseManager.tables[BTI.name]
      this.userManager = new UserManager(this.databaseManager)
      this.commandManager.load()
      await this.commandManager.reloadCommands().catch(err => { return reject(err) })
      this.logger.log('Successfully loaded.')
      resolve()
    })
  }

  /**
   * @param {string} directory
   * @param {boolean} generateFolders
   * @param {boolean} defaultFolder
   * @return {Promise<void>}
   */
  registerDir (directory, generateFolders, defaultFolder) {
    // TODO: possibly move register events?
    return new Promise(async (resolve, reject) => {
      await this.databaseManager.loadFile(`${directory}/database.js`).catch(err => { return reject(err) })
      this.registerEvents(`${directory}/events`, generateFolders)
      this.commandManager.addDir(`${directory}/commands`, generateFolders, defaultFolder)
      resolve()
    })
  }

  registerEvents (directory, generateFolders) {
    let events = load(directory, generateFolders)
    if (events == null) return
    for (let event in events) {
      /** @type {function(obj, Catbot)} */
      let eventFunc = events[event]
      if (eventFunc instanceof Function) {
        let logger = new Logger(`event::${event}`, this.logger)
        this.client.on(event, (data) => {
          try {
            eventFunc.call({ logger }, data, this)
          } catch (ex) {
            this.logger.error(`Event '${event}' crashed! : ${ex.stack}`)
          }
        })
      } else {
        this.logger.warn(`Could not load event '${event}': No function was exported`)
      }
    }
  }

  /**
   * @return {Promise<void>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      this.logger.log('Connecting...')
      this.client.on('ready', () => {
        this.logger.log('Successfully connected.')
        resolve()
      })
      this.client.connect()
    })
  }

  /**
   * @param {string} file
   */
  loadConfig (file) {
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
          config[key] = this.getInput(key)
          updated = true
        }
      }
      if (updated) {
        writeConfig(config)
        this.logger.log('Config file updated.')
      }
      this.config = config
    } else {
      this.logger.warn('No config file detected!\nCreating new config file...')
      let config = new Config()
      for (let key in config) {
        if (config[key] == null) config[key] = this.getInput(`Enter ${key}`)
      }
      writeConfig(config)
      this.logger.log('Config file generated')
      this.config = config
    }
  }

  /**
   * @param {string} msg
   * @return {string}
   */
  getInput (msg) {
    return readline.question(this.logger.getLogString(`${msg}: `))
  }

  /**
   * @return {Promise<void>}
   */
  start () {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.connect().then(resolve, reject)
      }, reject)
    })
  }

  /**
   * restarts the bot
   * @param {boolean} [reloadFiles]
   * @return {Promise<Catbot>}
   */
  restart (reloadFiles = false) {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Restarting...')
      this.client.disconnect()
      if (reloadFiles) {
        Object.keys(require.cache).forEach(function (key) { if (!key.includes('node_modules')) delete require.cache[key] })
        let NewCatbot = require(__filename)
        let bot = new NewCatbot(this.directory)
        bot.start().then(() => {
          this.onrestart(bot)
          resolve(bot)
        }, err => {
          this.onrestart(bot, err)
          reject(err)
        })
      } else {
        this.temp = {}
        this.start().then(resolve.bind(null, this), reject.bind(null, this))
      }
    })
  }

  /**
   * stops the bot
   * @return {void}
   */
  stop () {
    this.logger.info('Stopping...')
    this.client.disconnect()
  }

  // Database Functions

  /**
   * @param {any} key
   * @param {any} [defaultValue]
   * @return {Promise<any>}
   */
  get (key, defaultValue = null) {
    return this.table.get(key, 'value', defaultValue)
  }

  /**
   * @param {any} key
   * @param {any} value
   * @return {Promise<void>}
   */
  set (key, value) {
    return this.table.set(key, { name: 'value', value })
  }
}

module.exports = Catbot
