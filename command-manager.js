const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const fs = require('fs')

const load = require('./load.js')
const Catbot = require('./bot.js') // eslint-disable-line no-unused-vars
const Command = require('./command.js')
const Logger = require('./logger.js')
const Arg = require('./arg.js')
const commandTableInfo = require('./default/database.js').commands

class CommandResult {
  /**
   * @param {string | Command} data
   * @param {string} [name]
   * @param {string} [content]
   */
  constructor (data, name, content) {
    this.error = typeof (data) === 'boolean' ? data : !(data instanceof Command)
    this.data = data
    this.content = content
    this.name = name
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
   */

  /**
   * @param {Catbot} bot
   */
  constructor (bot) {
    /** @type {Catbot} */
    this.bot = bot
    /** @type {Logger} */
    this.logger = new Logger('command manager', bot.logger)
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
      this.commandTable = await this.bot.databaseManager.getTable(commandTableInfo.name)
      resolve()
    })
  }

  /**
   * @param {string} directory
   */
  addDir (directory, generateFolders) {
    this.loadDirs.push({ path: directory, generateFolders })
  }

  /**
   * @param {Command} command
   * @return {Promise}
   */
  addCommand (command) {
    return new Promise(async (resolve, reject) => {
      command.prepare(this.logger)
      let commandPerms = await this.getCommandPermissions(command.name)
      if (commandPerms == null) {
        this.setCommandPermissions(command.name, command.defaultTags)
      }
      if (this.commands.find(cmd => { return cmd.name === command.name })) {
        this.logger.warn(`Conflicting commands found! There are 2 commands with the name '${command.name}', ignoring the new one...`)
      } else {
        this.commands.push(command)
      }
    })
  }

  /**
   * @return {Promise}
   */
  reloadCommands () {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Reloading commands...')
      this.commands = []
      for (let dir of this.loadDirs) {
        let commandFuncs = load(dir.path, dir.generateFolders)
        if (commandFuncs == null) resolve()
        for (let commandFunc in commandFuncs) {
          try {
            /** @type {Command} */
            let command = commandFuncs[commandFunc](this.bot)
            this.addCommand(command)
          } catch (ex) {
            this.logger.error(`Could not load command from file '${commandFunc}': ${ex.stack}`)
          }
        }
      }
      resolve()
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
   * @param {string} name - the name of the command
   * @param {boolean} [ignoreNone] - whether to return an empty array if permissions don't exist or not
   * @return {Promise<string[]>}
   */
  getCommandPermissions (name, ignoreNone = false) {
    return new Promise((resolve, reject) => {
      this.commandTable.select([commandTableInfo.cols.permissions.name], `name = '${name}'`).then(rows => {
        if (rows.length < 1) {
          if (ignoreNone) resolve([])
          else resolve(undefined)
        } else {
          if (rows[0][commandTableInfo.cols.permissions.name] === '') resolve([])
          else resolve(rows[0][commandTableInfo.cols.permissions.name].split(','))
        }
      })
    })
  }

  /**
   * @param {string} name - the name of the command
   * @param {string[]} permissions - the permissions to give the command
   * @return {Promise}
   */
  setCommandPermissions (name, permissions) {
    return new Promise((resolve, reject) => {
      this.commandTable.insert(['name', commandTableInfo.cols.permissions.name], [name, permissions.join(',')], true).then(() => {
        resolve()
      })
    })
  }

  /**
   * @param {Message} msg
   * @return {Promise<boolean>}
   */
  handle (msg) {
    return new Promise(async (resolve, reject) => {
      let result = this.parseFull(msg.content)
      await this.run(result, msg)
      resolve()
    })
  }

  /**
   * @param {CommandResult} result
   * @param {Message} msg
   * @param {boolean} [sudo]
   */
  run (result, msg, sudo = false) {
    return new Promise(async (resolve, reject) => {
      if (result.error) {
        this.bot.client.createMessage(msg.channel.id, result.data)
      } else if (result.data instanceof Command) {
        let command = result.data
        if (sudo || await this.checkPerms(command, msg.author.id)) {
          command.run(msg, result.content, this.bot).then(() => {
            if (!command.silent) this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' ran command '${result.name}'`)
          }, (err) => {
            this.logger.error(`Command '${result.name}' crashed: ${err.stack}`)
          })
        } else {
          this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' did not have permission to run command '${result.name}'`)
          this.bot.client.createMessage(msg.channel.id, ':lock: You do not have permission to use this command')
        }
      }
    })
  }

  /**
   * @param {Command} command
   * @param {string} userId
   * @return {Promise<boolean>}
   */
  checkPerms (command, userId) {
    return new Promise(async (resolve, reject) => {
      let userTags = await this.bot.getUserPermTags(userId)

      if (userTags.includes('blacklist')) {
        return resolve(false)
      }

      let commandTags = await this.getCommandPermissions(command.name, true)

      if (commandTags.find(tag => { return userTags.includes(tag) })) {
        if (!command.defaultPermission) return resolve(true)
        else resolve(false)
      } else {
        if (command.defaultPermission) return resolve(true)
        else resolve(false)
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
   * @param {Command[]} [parents]
   * @return {CommandResult}
   */
  parseContent (content, commands, parents = []) {
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
            let finalResult = null
            let unknownArgType = false
            for (let typeName of types) {
              let type = Arg.type[typeName]
              if (type) {
                let result = type.validate(content, this.bot)
                if (result.failed) {
                  finalResult = types.length > 1
                    ? new CommandResult(`No suitable arguement was provided for '${arg.name}'\nAcceptable types: [${types.join(', ')}]`, parents.join(' '))
                    : new CommandResult(result.data, parents.join(' '))
                } else {
                  args[arg.name] = result.data
                  if (result.subcontent == null) result.subcontent = ''
                  content = result.subcontent.trim()
                  finalResult = null
                  break
                }
              } else {
                if (typeName !== 'any') this.logger.warn(`Arguement '${arg.name}' in command '${parents.join(' ')}' uses type '${typeName}' which does not exist! Assuming any...`)
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
            return new CommandResult(`Arguement ${arg.name} was not provided`, parents.join(' '))
          }
        }
        return new CommandResult(command, parents.join(' '), args)
      } else {
        return new CommandResult(command, parents.join(' '), content)
      }
    }

    for (let command of commands) {
      let alias = startsWithAny(content, command.getTriggers())
      if (alias) {
        let subcontent = content.slice(alias.length)
        if (subcontent.charAt(0) === ' ') subcontent = subcontent.slice(1)
        parents.push(command.name)
        if (command.subcommands.length > 0) {
          let result = this.parseContent(subcontent, command.subcommands, parents)
          if (result.error && command.run != null) return handleCommand(command, subcontent)
          else return result
        } else if (command.run != null) {
          return handleCommand(command, subcontent)
        } else {
          this.logger.warn(`Command '${command.name}' has nothing to run!`)
        }
      }
    }
    if (content === '') return parents.length === 0 ? new CommandResult('No command was provided') : new CommandResult(`No subcommand was provided for '${parents[parents.length - 1]}'`, parents.join(' '))
    else return new CommandResult(`I'm not sure what you meant by "${content.split(' ')[0]}"`)
  }
}

module.exports = CommandManager
