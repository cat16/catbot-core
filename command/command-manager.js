const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const fs = require('fs')

const Command = require('./command.js')
const Arg = require('./arg.js')
const load = require('../util/load.js')
const Catbot = require('../bot.js') // eslint-disable-line no-unused-vars
const Logger = require('../util/logger.js')
const CTI = require('../default/database.js').commands

class CommandResult {
  /**
   * @param {string | Command} data
   * @param {string} [content]
   */
  constructor (data, content) {
    this.error = typeof (data) === 'boolean' ? data : !(data instanceof Command)
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
   * @typedef Directory
   * @prop {string} path
   * @prop {boolean} generateFolders
   * @prop {boolean} defaultCommands
   */

  /**
   * @param {Catbot} bot
   */
  constructor (bot) {
    /** @type {Catbot} */
    this.bot = bot
    /** @type {Logger} */
    this.logger = new Logger('command-manager', bot.logger)
    /** @type {Command[]} */
    this.commands = []
    /** @type {Directory[]} */
    this.loadDirs = []
  }

  /**
   * @param {string} directory
   * @return {Promise}
   */
  load () {
    return new Promise(async (resolve, reject) => {
      this.prefixes = [this.bot.config.defaultPrefix]
      this.commandTable = await this.bot.databaseManager.getTable(CTI.name)
      resolve()
    })
  }

  /**
   * @param {string} directory
   * @param {boolean} generateFolders
   */
  addDir (directory, generateFolders, defaultCommands) {
    this.loadDirs.push({ path: directory, generateFolders, defaultCommands })
  }

  /**
   * @param {Command} command
   * @return {Promise}
   */
  addCommand (command) {
    return new Promise(async (resolve, reject) => {
      await command.load(this.logger, this.commandTable)
      if (!this.commands.find((cmd, index) => {
        if (cmd.name === command.name) {
          if (cmd.defaultCommand) {
            this.commands.splice(index, 1)
          } else {
            reject(new Error(`Conflicting commands found: There are 2 commands with the name '${command.name}'`))
            return true
          }
        }
        return false
      })) this.commands.push(command)
      resolve()
    })
  }

  /**
   * @return {Promise}
   */
  reloadCommands () {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Reloading commands...')
      this.commands = []
      let loadedDirs = 0
      for (let dir of this.loadDirs) {
        let commandFuncs = load(dir.path, dir.generateFolders)
        if (commandFuncs == null) {
          loadedDirs++
          continue
        }
        let unloaded = 0
        let loaded = 0
        for (let commandFunc in commandFuncs) {
          unloaded++
          /** @type {Command} */
          let command = commandFuncs[commandFunc](this.bot)
          if (dir.defaultCommands) command.defaultCommand = true
          this.addCommand(command).then(() => {
            loaded++
            if (loaded >= unloaded) {
              this.logger.info(`Loaded ${loaded} commands from ${dir.path}`)
              loadedDirs++
              if (loadedDirs >= this.loadDirs.length) resolve()
            }
          }, (err) => {
            this.logger.error(`Could not load command from file '${commandFunc}': ${err.stack}`)
            unloaded--
          })
        }
      }
    })
  }

  /**
   * @param {string} name
   * @return {Promise}
   */
  reloadCommand (name) {
    return new Promise(async (resolve, reject) => {
      this.logger.info(`Attemping to reload command '${name}'...`)
      for (let dir of this.loadDirs) {
        let path = `${dir.path}/${name}.js`
        if (fs.existsSync(path)) {
          try {
            /** @type {Command} */
            let command = require(path)(this.bot)
            delete require.cache[require.resolve(path)]
            this.commands = this.commands.filter(c => c.name !== name)
            if (dir.defaultCommands) command.defaultCommand = true
            this.addCommand(command)
            resolve()
            return
          } catch (ex) {
            reject(new Error(`Could not reload command '${name}':\n\`\`\`js\n${ex.stack}\n\`\`\``))
            return
          }
        }
      }
      reject(new Error(`:x: No command named '${name}' found`))
    })
  }

  /**
   * @param {Message} msg
   * @return {Promise<boolean>}
   */
  handleMessage (msg) {
    return new Promise(async (resolve, reject) => {
      let result = this.parseFull(msg.content)
      await this.runResult(result, msg)
      resolve()
    })
  }

  /**
   * @param {CommandResult} result
   * @param {Message} msg
   * @param {boolean} [sudo]
   */
  runResult (result, msg, sudo = false) {
    return new Promise(async (resolve, reject) => {
      if (result.error) {
        if (!this.bot.config.silent) this.bot.client.createMessage(msg.channel.id, result.data)
      } else if (result.data instanceof Command) {
        let command = result.data
        if (sudo || await this.checkPerms(command, msg.author.id)) {
          command.run(msg, result.content, this.bot).then(() => {
            if (!command.silent) this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' ran command '${command.getFullName()}'`)
          }, (err) => {
            this.logger.error(`Command '${command.getFullName()}' crashed: ${err.stack}`)
          })
        } else {
          this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' did not have permission to run command '${command.getFullName()}'`)
          if (!this.bot.config.silent) this.bot.client.createMessage(msg.channel.id, ':lock: You do not have permission to use this command')
        }
      }
    })
  }

  /**
   * @param {string} msg
   * @return {CommandResult}
   */
  parseFull (msg) {
    let prefix = startsWithAny(msg, this.prefixes)
    if (prefix) {
      let result = this.parseContent(msg.slice(prefix.length), this.commands)
      return result
    }
    return new CommandResult(false)
  }

  /**
   * @param {string} content
   * @param {Command[]} commands
   * @param {Command[]} [parent]
   * @return {CommandResult}
   */
  parseContent (content, commands, parent) {
    /**
     * @param {Command} command
     * @param {string} content
     * @return {CommandResult}
     */
    let handleCommand = (command, content) => {
      if (command.args.length > 0) {
        let args = {}
        for (let arg of command.args) {
          let types = arg.type.split('|')
          if (content != null && content.length > 0) {
            let finalResult = new CommandResult(`No suitable arguement was provided for '${arg.name}'\nAcceptable types: [${types.join(', ')}]`)
            let unknownArgType = false
            for (let typeName of types) {
              let type = Arg.type[typeName]
              if (type) {
                let result = type.validate(content, this.bot)
                if (result.failed) {
                  if (types.length === 1) finalResult = new CommandResult(result.data)
                } else {
                  args[arg.name] = result.data
                  if (result.subcontent == null) result.subcontent = ''
                  content = result.subcontent.trim()
                  finalResult = null
                  break
                }
              } else {
                if (typeName !== 'any') this.logger.warn(`Arguement '${arg.name}' in command '${command.name}' uses type '${typeName}' which does not exist! Assuming any...`)
                unknownArgType = true
              }
            }
            if (finalResult) {
              if (types.includes('any') || unknownArgType) {
                let parts = content.split(/ (.+)/)
                args[arg.name] = parts[0]
                content = parts[1]
              } else return finalResult
            }
          } else {
            return new CommandResult(`Arguement ${arg.name} was not provided`)
          }
        }
        args.extra = content
        return new CommandResult(command, args)
      } else {
        return new CommandResult(command, content)
      }
    }

    for (let command of commands) {
      let alias = startsWithAny(content, command.getTriggers())
      if (alias) {
        let subcontent = content.slice(alias.length).trimLeft()
        if (command.subcommands.length > 0) {
          let result = this.parseContent(subcontent, command.subcommands, command)
          if (result.error && command.runFunc != null) return handleCommand(command, subcontent)
          else return result
        } else if (command.runFunc != null) {
          return handleCommand(command, subcontent)
        } else {
          this.logger.warn(`Command '${command.name}' has nothing to run!`)
        }
      }
    }
    if (content === '') return parent === null ? new CommandResult('No command was provided') : new CommandResult(`No subcommand was provided for '${parent.name}'`)
    else return new CommandResult(`I'm not sure what you meant by "${content.split(' ')[0]}"`)
  }

  /**
   * @param {Command} command
   * @param {string} userId
   * @return {Promise<boolean>}
   */
  checkPerms (command, userId) {
    return new Promise(async (resolve, reject) => {
      let userTags = await this.bot.userManager.getUserPermTags(userId, true)
      if (userTags.includes('blacklist')) {
        return resolve(false)
      }
      let commandTags = await command.getPermissions(true)
      if (commandTags.find(tag => { return userTags.includes(tag) })) {
        if (!(await command.getDefaultPermission(true))) return resolve(true)
        else resolve(false)
      } else {
        if (await command.getDefaultPermission(true)) return resolve(true)
        else resolve(false)
      }
    })
  }

  /**
   * @typedef CommandSearchResult
   * @prop {Command} command
   * @prop {string} content
   */

  /**
   * searches a string for a command
   * @param {string} content
   * @param {boolean} [complete]
   * @param {Command[]} [commands]
   * @return {CommandSearchResult}
   */
  findCommand (content, complete = false, commands = this.commands) {
    let result = null
    commands.find(c => {
      return c.getTriggers().find(alias => {
        if (content.startsWith(alias)) {
          content = content.slice(alias.length).trimLeft()
          if (c.subcommands.length > 0) {
            result = this.findCommand(content, complete, c.subcommands)
            if (result == null && (!complete || c.runFunc != null)) result = { command: c, content }
          } else result = { command: c, content }
          return true
        }
      }) !== undefined
    })
    return result
  }
}

module.exports = CommandManager
