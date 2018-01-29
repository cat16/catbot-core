const Eris = require('eris')

const fs = require('fs')
const readline = require('readline-sync')

const Logger = require('./logger.js')
const load = require('./load.js')
const Config = require('./config.js')
const DatabaseManager = require('./database-manager.js')
const CommandManager = require('./command-manager.js')
const Command = require('./command.js') // eslint-disable-line no-unused-vars
const userTableInfo = require('./default/database.js').users

class Catbot {
  /**
   * @param {String} directory
   */
  constructor (directory) {
    this.directory = directory
    this.logger = new Logger('bot-core')
    this.tools = {}
    this.databaseManager = new DatabaseManager('storage')
    this.commandManager = new CommandManager(this)
    this.client = null
    /** @type {Config} */
    this.config = null
  }

  /**
   * @return {Promise}
   */
  load () {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Loading...')
      this.loadConfig('config.json')
      this.client = new Eris.Client(this.config.token, {})
      // TODO: make this a waterfall?
      await this.databaseManager.load()
      await this.registerDir(`${__dirname}/default`, false)
      await this.registerDir(this.directory, this.config.generateFolders)
      this.userTable = await this.databaseManager.getTable(userTableInfo.name)
      await this.commandManager.load()
      this.commandManager.reloadCommands()
      this.logger.log('Loaded.')
      resolve()
    })
  }

  /**
   * @return {Promise}
   */
  registerDir (directory, generateFolders) {
    // TODO: possibly move register tools & events?
    return new Promise(async (resolve, reject) => {
      await this.databaseManager.loadFile(`${directory}/database.js`)
      this.registerTools(`${directory}/tools`, generateFolders)
      this.registerEvents(`${directory}/events`, generateFolders)
      this.commandManager.addDir(`${directory}/commands`, generateFolders)
      resolve()
    })
  }

  registerTools (directory, generateFolders) {
    let tools = load(directory, generateFolders)
    if (tools == null) return
    for (let tool in tools) {
      if (this.tools[tools] != null) this.logger.warn(`Conflicting tools found! There are 2 tools with the name '${tool}', ignoring the new one...`)
      else this.tools[tools] = tools[tool]
    }
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

    if (!fs.existsSync(`${this.directory}/${file}`)) {
      this.logger.warn('No config file detected!\nCreating new config file...')
      let config = new Config()
      for (let key in config) {
        if (config[key] == null) config[key] = this.getInput(`Enter ${key}`)
      }
      writeConfig(config)
      this.logger.log('Config file generated')
      this.config = config
    } else {
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
   * @param {string} id
   * @return {Promise<string[]>}
   */
  getUserPermTags (id) {
    return new Promise((resolve, reject) => {
      this.userTable.select([userTableInfo.cols.permTags.name], `${userTableInfo.cols.id.name} = ${id}`).then(rows => {
        if (rows.length < 1) {
          resolve([])
        } else {
          if (rows[0].permTags === '') resolve([])
          else resolve(rows[0].permTags.split(','))
        }
      })
    })
  }

  /**
   * @param {string} id
   * @param {string[]} tags
   * @return {Promise<string[]>}
   */
  setUserPermTags (id, tags) {
    return new Promise((resolve, reject) => {
      this.userTable.insert([userTableInfo.cols.id.name, userTableInfo.cols.permTags.name], [id, tags.join(',')], true).then(() => {
        resolve()
      })
    })
  }
}

module.exports = Catbot
