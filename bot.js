const Eris = require('eris')

const fs = require('fs')
const readline = require('readline-sync')

const Logger = require('./logger.js')
const load = require('./load.js')
const CommandManager = require('./command-manager.js')
const Command = require('./command.js') // eslint-disable-line no-unused-vars

class Config {
  /**
   * @typedef ConfigOptions
   * @prop {String} token
   * @prop {String} ownerID
   * @prop {String} defaultPrefix
   * @prop {boolean} [generateFolders]
   */

  /**
   * @param {ConfigOptions} options
   */
  constructor (options) {
    // general
    if (options == null) options = {}
    this.token = options.token
    this.ownerID = options.ownerID
    this.defaultPrefix = options.defaultPrefix
    this.generateFolders = options.generateFolders || true
    // TODO: responses maybe?
  }
}

class Catbot {
  /**
   * @param {String} directory
   */
  constructor (directory, options) {
    this.directory = directory
  }

  load () {
    this.logger = new Logger('bot-core')
    this.logger.log('Loading...')
    this.config = this.getConfig()
    this.client = new Eris.CommandClient(this.config.token, {}, { owner: this.config.ownerID, prefix: this.config.defaultPrefix })
    this.commandManager = new CommandManager(this)
    this.tools = {}
    // register everything
    this.registerDir(`${__dirname}/default`, false)
    this.registerDir(this.directory, this.config.generateFolders)

    this.loaded = true
    this.logger.log('Loaded.')
  }

  registerDir (directory, generateFolders) {
    this.registerTools(`${directory}/tools`, generateFolders)
    this.registerEvents(`${directory}/events`, generateFolders)
    this.registerCommands(`${directory}/commands`, generateFolders)
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

  registerCommands (directory, generateFolders) {
    let commandFuncs = load(directory, generateFolders)
    if (commandFuncs == null) return
    for (let commandFunc in commandFuncs) {
      try {
        /** @type {Command} */
        let command = commandFuncs[commandFunc](this)
        command.prepare(this.logger)
        this.commandManager.addCommand(command)
      } catch (ex) {
        this.logger.error(`Could not load command from file '${commandFunc}': ${ex.stack}`)
      }
    }
  }

  connect () {
    if (this.loaded) {
      this.logger.log('Connecting...')
      this.client.on('ready', () => {
        this.logger.log('Connected.')
      })
      this.client.connect()
    } else {
      throw new Error('Bot could not connect: Bot not loaded!')
    }
  }

  /**
   * @return {Config}
   */
  getConfig () {
    let CONFIG_FILE = 'config.json'

    let writeConfig = (config) => {
      fs.writeFileSync(`${this.directory}/${CONFIG_FILE}`, JSON.stringify(config, null, '\t'))
    }

    if (!fs.existsSync(`${this.directory}/${CONFIG_FILE}`)) {
      this.logger.warn('No config file detected!\nCreating new config file...')
      let config = new Config()
      for (let key in config) {
        if (config[key] == null) config[key] = this.getInput(`Enter ${key}`)
      }
      writeConfig(config)
      this.logger.log('Config file generated')
      return config
    } else {
      let config = require(`${this.directory}/${CONFIG_FILE}`)
      let updated = false
      let neededConfig = new Config()
      for (let key in neededConfig) {
        if (config[key] == null && neededConfig[key] === undefined) {
          this.logger.warn(`No ${key} found in config!`)
          config[key] = this.getInput(`Enter ${key}`)
          updated = true
        }
      }
      if (updated) {
        writeConfig(config)
        this.logger.log('Config file updated.')
      }
      return config
    }
  }

  /**
   * @param {string} msg
   * @return {string}
   */
  getInput (msg) {
    return readline.question(this.logger.getLogString(`${msg}: `))
  }
}

module.exports = Catbot
