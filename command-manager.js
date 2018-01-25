const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const Catbot = require('./bot.js') // eslint-disable-line no-unused-vars
const Command = require('./command.js')
const Logger = require('./logger.js')

class CommandResult {
  /**
   * @param {boolean} error
   * @param {string | Command} [data]
   * @param {string} [content]
   */
  constructor (data, content) {
    this.error = !(data instanceof Command)
    this.data = data
    this.content = content
  }
}

/**
 * @return {string}
 * @param {string} find
 * @param {string[]} arr
 */
let startsWithAny = (str, arr) => {
  return arr.find(str2 => {
    return str.startsWith(str2)
  })
}

class CommandManager {
  /**
   * @param {Catbot} bot
   */
  constructor (bot) {
    this.bot = bot
    this.logger = new Logger('command manager', bot.logger)
    this.prefixes = [this.bot.config.defaultPrefix]
    /** @type {Command[]} */
    this.commands = []
  }

  /**
   * @param {Command} command
   */
  addCommand (command) {
    if (this.commands.find(cmd => { return cmd.name === command.name })) {
      this.logger.warn(`Conflicting commands found! There are 2 commands with the name '${command.name}', ignoring the new one...`)
    } else {
      this.commands.push(command)
    }
  }

  /**
   * @param {Message} msg
   */
  handle (msg) {
    let result = this.parse(msg.content)
    if (result.error) {
      this.bot.client.createMessage(msg.channel.id, result.data)
    } else if (result.data instanceof Command) {
      let command = result.data
      command.run(msg, result.content, this.bot).then(() => {
        this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' ran command '${command.name}'`)
      }, (err) => {
        this.logger.error(`Command '${command.name}' crashed: ${err.stack}`)
      })
    }
  }

  /**
   * @param {string} msg
   * @return {CommandResult}
   */
  parse (msg) {
    let prefix = startsWithAny(msg, this.prefixes)
    if (prefix) {
      let result = this.parseCommand(msg.slice(prefix.length), this.commands)
      return result
    }
    return new CommandResult(false)
  }

  /**
   * @param {string} prefix
   * @param {string} content
   * @param {Command[]} commands
   * @param {Command} parent
   * @return {CommandResult}
   */
  parseCommand (content, commands, parentName) {
    for (let command of commands) {
      let alias = startsWithAny(content, command.getTriggers())
      if (alias) {
        let subcontent = content.slice(alias.length)
        if (subcontent.charAt(0) === ' ') subcontent = subcontent.slice(1)
        if (command.run != null) {
          return new CommandResult(command, subcontent)
        } else {
          let result = this.parseCommand(subcontent, command.subcommands, command.name)
          return result
        }
      }
    }
    if (content === '') return parentName === undefined ? new CommandResult('No command was provided') : new CommandResult(`No arguement was provided for '${parentName}'`)
    else return new CommandResult(`I'm not sure what you meant by "${content.split(' ')[0]}"`)
  }
}

module.exports = CommandManager
