const eris = require('eris')
const { Client } = eris // eslint-disable-line no-unused-vars

const fs = require('fs')
const readline = require('readline-sync')

let Logger = require('./util/logger.js')
let load = require('./util/load.js')
let DatabaseManager = require('./util/database-manager.js')
let Config = require('./config.js')
let CommandManager = require('./command/command-manager.js')
let UserManager = require('./user-manager.js')
let Util = require('./util/util.js')

let reloadModules = () => {
  Object.keys(require.cache).forEach(function (key) { if (!key.includes('node_modules')) delete require.cache[key] })
  Logger = require('./util/logger.js')
  load = require('./util/load.js')
  DatabaseManager = require('./util/database-manager.js')
  Config = require('./config.js')
  CommandManager = require('./command/command-manager.js')
  UserManager = require('./user-manager.js')
  Util = require('./util/util.js')
}

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
    /** @type {UserManager} */
    this.userManager = null
    /** @type {Client} */
    this.client = null
    /** @type {Config} */
    this.config = null
  }

  /**
   * @return {Promise}
   */
  load () {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger('bot-core')
      this.logger.log('Loading...')
      this.util = new Util(this)
      this.databaseManager = new DatabaseManager('storage', this.logger)
      this.commandManager = new CommandManager(this)
      this.loadConfig('config.json')
      this.client = new eris.Client(this.config.token, {})
      // TODO: make this a waterfall?
      await this.databaseManager.load()
      await this.registerDir(`${__dirname}/default`, false, true)
      await this.registerDir(this.directory, this.config.generateFolders, false)
      this.userManager = new UserManager(await this.databaseManager.getTable('users'))
      await this.commandManager.load()
      await this.commandManager.reloadCommands()
      this.logger.log('Loaded.')
      resolve()
    })
  }

  /**
   * @param {string} directory
   * @param {boolean} generateFolders
   * @param {boolean} defaultFolder
   * @return {Promise}
   */
  registerDir (directory, generateFolders, defaultFolder) {
    // TODO: possibly move register events?
    return new Promise(async (resolve, reject) => {
      await this.databaseManager.loadFile(`${directory}/database.js`)
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
          eventFunc.call({ logger }, data, this)
        })
      } else {
        this.logger.warn(`Could not load event '${event}': No function was exported`)
      }
    }
  }

  /**
   * @return {Promise}
   */
  connect () {
    return new Promise((resolve, reject) => {
      this.logger.log('Connecting...')
      this.client.on('ready', () => {
        this.logger.log('Connected.')
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
   * @return {Promise}
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
   * @return {Promise}
   */
  restart () {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Restarting...')
      this.client.disconnect()
      reloadModules()
      this.start().then(resolve, reject)
    })
  }
}

module.exports = Catbot
