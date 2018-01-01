const Eris = require('eris')
const { CommandOptions, Message } = require('eris') // eslint-disable-line no-unused-vars
const fs = require('fs')
const readline = require('readline-sync')
const load = require('./load.js')

class Config {
  /**
   * @param {String} token
   * @param {String} ownerID
   */
  constructor (token, ownerID, defaultPrefix) {
    this.token = token
    this.ownerID = ownerID
    this.defaultPrefix = defaultPrefix
  }
}

class Catbot {
  /**
   * @param {String} directory
   */
  constructor (directory) {
    this.directory = directory
  }

  load () {
    this.log('Loading...')
    this.config = this.getConfig()
    this.tools = load(`${this.directory}/tools`)
    this.client = new Eris.CommandClient(this.config.token, {}, { owner: this.config.ownerID, prefix: this.config.defaultPrefix })
    let events = load(`${this.directory}/events`)
    for (let event in events) {
      if (events[event] instanceof Function) {
        this.client.on(event, (data) => {
          events[event](data, this)
        })
      } else {
        this.log(`Could not load event '${event}': No function was exported`)
      }
    }
    let commands = load(`${this.directory}/commands`)
    for (let cmd in commands) {
      /**
       * @type {Command}
       */
      let command = commands[cmd](this)
      this.log(require('util').inspect(command.options))
      this.client.registerCommand(command.name, (msg, args) => {
        command.prepare(this)
        command.run(msg, args, this)
      }, command.options)
    }
    this.loaded = true
    this.log('Loaded.')
  }

  connect () {
    if (this.loaded) {
      this.log('Connecting...')
      this.client.on('ready', () => {
        this.log('Connected.')
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
    let neededConfig = new Config()

    let writeConfig = (config) => {
      fs.writeFileSync(`${this.directory}/${CONFIG_FILE}`, JSON.stringify(config, null, '\t'))
    }

    if (!fs.existsSync(`${this.directory}/${CONFIG_FILE}`)) {
      this.log('No config file detected!\nCreating new config file...')
      let config = neededConfig
      for (let key in config) {
        config[key] = this.getInput(`Enter ${key}`)
      }
      writeConfig(config)
      this.log('Config file generated')
      return config
    } else {
      let config = require(`${this.directory}/${CONFIG_FILE}`)
      let updated = false
      for (let key in neededConfig) {
        if (config[key] == null) {
          this.log(`No ${key} found in config!`)
          config[key] = this.getInput(`Enter ${key}`)
          updated = true
        }
      }
      if (updated) {
        writeConfig(config)
        this.log('Config file updated.')
      }
      return config
    }
  }

  /**
   * @param {string} msg
   * @return {string}
   */
  getInput (msg) {
    return readline.question(this.getLogString(`${msg}: `))
  }

  /**
   * generates the string `log(msg)` outputs
   * @param {string} msg
   * @return {string}
   */
  getLogString (msg) {
    return `[bot] ${msg}`
  }

  /**
   * logs a message to the console
   * @param {string} msg
   */
  log (msg) {
    console.log(this.getLogString(msg))
  }
}

let Command = class Command {
  /**
   * @param {String} name
   * @param {function(Message, String[], Catbot)} run
   * @param {CommandOptions} [options]
   */
  constructor (name, run, options) {
    this.name = name
    this.run = run
    this.options = options
  }

  /**
   * @param {Catbot} bot
   */
  prepare (bot) {
    this.bot = bot
  }

  /**
   * logs a message
   * @param {string} msg
   */
  log (msg) {
    this.bot.log(`[Command:${this.name}] ${msg}`)
  }
}

Catbot.Command = Command
module.exports = Catbot
