import { Message, User } from 'eris'
import chalk from 'chalk'

import { ElementLoader, ElementManager, RecursiveElementManager, ElementGroup } from '../handler'
import Command, { ArgList, CommandContext } from './command'
import { ArgType } from './arg'
import Bot from '../../bot'
import Logger from '../../util/logger'
import TableManager from '../../database/table-manager'

export class CommandManager extends RecursiveElementManager<Command> {
  constructor(directory: string, parent?: Command) {
    super(
      directory,
      (rawElement) => {
        return new rawElement()
      },
      parent
    )
  }
}

let startsWithAny = (str: string, arr: string[]): string => {
  let longest = ''
  arr.forEach(str2 => {
    if (str2.length > longest.length && str.startsWith(str2)) longest = str2
  })
  return longest.length === 0 ? null : longest
}

export class CommandResult {
  command: Command
  args: ArgList
  constructor(command: Command, args: ArgList) {
    this.command = command
    this.args = args
  }
}

export class CommandError {
  message: string
  command?: Command | ElementGroup<Command>
  constructor(message: string, command?: Command | ElementGroup<Command>) {
    this.message = message
    this.command = command
  }
}

interface Trigger {
  time: number
  alreadyTold: boolean
}

export type PermCheck = (command: Command, user: User) => boolean

export class CommandLoader extends ElementLoader<Command | ElementGroup<Command>> {

  permChecks: PermCheck[]
  bot: Bot

  prefixes: string[]
  commandTable: TableManager
  lastTriggered: object
  logger: Logger

  constructor(bot: Bot) {
    super()
    this.prefixes = [bot.client.user.mention]
    this.lastTriggered = {}
    this.bot = bot
    this.logger = new Logger('command-manager', bot.getLogger())
  }

  handleMessage(msg: Message): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let result = this.parseFull(msg.content)
      if (result && await this.shouldRespond(result)) {
        let cooldown: number = await this.bot.get('commandCooldown')
        if (cooldown != null) {
          let lastTriggered: Trigger = this.lastTriggered[msg.author.id]
          if (lastTriggered != null) {
            let now = new Date().getTime()
            if (now - lastTriggered.time < cooldown) {
              if (lastTriggered.alreadyTold) {
                return resolve(false)
              } else {
                this.bot.client.createMessage(msg.channel.id,
                  `:clock1: Please wait before using another command (${Math.ceil((cooldown - (now - lastTriggered.time)) / 1000)} seconds left)`
                )
                this.lastTriggered[msg.author.id] = {
                  time: lastTriggered.time,
                  alreadyTold: true
                }
                return resolve(true)
              }
            }
          }
        }
        this.runResult(result, msg).then(resolve, reject)
        this.lastTriggered[msg.author.id] = {
          time: new Date().getTime(),
          alreadyTold: false
        }
      }
      resolve(false)
    })
  }

  shouldRespond(result: CommandResult | CommandError): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let silent = await this.bot.get('silent', false)
      let respondToUnknownCommands = await this.bot.get('respondToUnknownCommands', false)
      resolve(!(silent && result instanceof CommandError) && (result || respondToUnknownCommands))
    })
  }

  runResult(result: CommandResult | CommandError, msg: Message, sudo: boolean = false): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (result instanceof CommandError) {
        if (await this.shouldRespond(result))
          this.bot.client.createMessage(msg.channel.id, result.message)
        resolve(true)
      } else if (result instanceof CommandResult) {
        let command = result.command
        if (sudo || await this.checkPerms(command, msg.author)) {
          try {
            await command.run(new CommandContext(this.bot, msg, result.args))
            if (!command.silent) this.logger.log(`'${chalk.magenta(`${msg.author.username}#${msg.author.discriminator}`)}' ran command '${chalk.magenta(command.getName())}'`)
          } catch (err) {
            this.logger.error(`Command '${command.getName()}' crashed: ${err.stack}`)
          }
        } else {
          this.logger.log(`'${chalk.magenta(`${msg.author.username}#${msg.author.discriminator}`)}' did not have permission to run command '${chalk.magenta(command.getName())}'`)
          if (!command.silent) this.bot.client.createMessage(msg.channel.id, ':lock: You do not have permission to use this command')
        }
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  parseFull(msgContent: string): CommandResult | CommandError {
    let prefix = startsWithAny(msgContent, this.prefixes)
    if (prefix) {
      let result = this.parseContent(msgContent.slice(prefix.length))
      return result
    }
    return null
  }

  parseContent(content: string, commands: (Command | ElementGroup<Command>)[] = this.getAllElements(), parent?: Command | ElementGroup<Command>): CommandResult | CommandError {
    let handleCommand = (command: Command, content: string): CommandResult | CommandError => {
      let args = new Map<string, any>()
      if (command.args.length > 0) {
        for (let arg of command.args) {
          let types = arg.types
          if (content != null && content.length > 0) {
            let finalResult = new CommandError(`No suitable arguement was provided for '${arg.name}'\nAcceptable types: [${types.join(', ')}]`)
            for (let type of types) {
              let result = type.validate(content, this.bot)
              if (result.failed) {
                if (types.length === 1) finalResult = new CommandError(<string>result.data, command)
              } else {
                args.set(arg.name, result.data)
                if (result.subcontent == null) result.subcontent = ''
                content = result.subcontent.trim()
                finalResult = null
                break
              }
            }
            if (finalResult) {
              if (types.find(type => type === ArgType.ANY)) {
                let parts = content.split(/ (.+)/)
                args.set(arg.name, parts[0])
                content = parts[1]
              } else return finalResult
            }
          } else {
            return new CommandError(`Arguement ${arg.name} was not provided`, command)
          }
        }
      }
      return new CommandResult(command, new ArgList(args, content))
    }

    for (let command of commands) {
      let alias = startsWithAny(content, command.getTriggers())
      if (alias) {
        let subcontent = content.slice(alias.length).trimLeft()
        if (command.getElementManager().getAllElements().length > 0) {
          let result = this.parseContent(subcontent, command.getElementManager().getAllElements(), command)
          if (!(result instanceof CommandError) && command instanceof Command) return handleCommand(command, subcontent)
          else return result
        } else if (command instanceof Command) {
          return handleCommand(command, subcontent)
        } else {
          this.logger.warn(`Command '${command.getTriggers()[0]}' has nothing to run!`)
        }
      }
    }
    return content === '' ?
      parent === null
        ? new CommandError('No command was provided')
        : new CommandError(`No subcommand was provided for '${parent.getTriggers()[0]}'`, parent)
      : new CommandError(`I'm not sure what you meant by "${content.split(' ')[0]}"`)
  }

  // TODO: move to bot
  checkPerms(command: Command, user: User): Promise<boolean> {
    return new Promise((resolve, reject) => {
      for (let permCheck of this.permChecks) {
        if (!permCheck(command, user)) return resolve(false)
      }
      resolve(true)
    })
  }
}
