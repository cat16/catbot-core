import { Message } from 'eris'

import * as fs from 'fs'

import Handler, { ElementSearchResult } from '../handler'
import Command from './command'
import Arg, { ArgType } from './arg'
import load from '../util/load'
import Catbot from '../bot'
import Logger from '../util/logger'
import TableManager from '../database/table-manager'
import TABLES from '../default/database'
const CTI = TABLES.commands

let startsWithAny = (str: string, arr: string[]): string => {
  let longest = ''
  arr.forEach(str2 => {
    if (str2.length > longest.length && str.startsWith(str2)) longest = str2
  })
  return longest.length === 0 ? null : longest
}

export class CommandResult {

  error: boolean
  data: string | Command | boolean
  content?: any

  constructor(data: string | Command | boolean, content?: any) {
    this.error = typeof (data) === 'boolean' ? data : !(data instanceof Command)
    this.data = data
    this.content = content
  }
}

interface Trigger {
  time: number
  alreadyTold: boolean
}

export default class CommandManager extends Handler<Command> {

  push(command: Command): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await command.load(this.logger, this.commandTable).catch(err => reject(err))
      if (!this.elements.some((cmd, index) => {
        if (cmd.name === command.name) {
          if (cmd.isDefault) {
            this.elements.splice(index, 1)
          } else {
            reject(new Error(`Conflicting commands found: There are 2 commands with the name '${command.name}'`))
            return true
          }
        }
        return false
      })) this.elements.push(command)
      resolve()
    })
  }

  find(content: string, complete: boolean = false, commands: Command[] = this.elements): ElementSearchResult<Command> {
    let result = null
    commands.find(c => {
      return c.getTriggers().find(alias => {
        if (content.startsWith(alias)) {
          content = content.slice(alias.length).trimLeft()
          if (c.subcommands.length > 0) {
            result = this.find(content, complete, c.subcommands)
            if (result == null && (!complete || c.runFunc != null)) result = { element: c, content }
          } else result = { element: c, content }
          return true
        }
      }) !== undefined
    })
    return result
  }

  prefixes: string[]
  commandTable: TableManager
  lastTriggered: object

  constructor(bot: Catbot) {
    super(bot, new Logger('command-manager', bot.logger), 'command')
    this.prefixes = [bot.config.defaultPrefix]
    this.lastTriggered = {}
  }

  load() {
    this.commandTable = this.bot.databaseManager.tables[CTI.name]
  }

  handleMessage(msg: Message): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let result = this.parseFull(msg.content)
      if ((result.error || result.data instanceof Command) && await this.shouldRespond(result)) {
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

  shouldRespond(result: CommandResult): Promise<boolean> {
    return new Promise(async(resolve, reject) => {
      let silent = await this.bot.get('silent', false)
      let respondToUnknownCommands = await this.bot.get('respondToUnknownCommands', false)
      resolve(!silent && (result.content != null || respondToUnknownCommands))
    })
  }

  runResult(result: CommandResult, msg: Message, sudo: boolean = false): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (result.error) {
        if (await this.shouldRespond(result))
          this.bot.client.createMessage(msg.channel.id, <string>result.data)
        resolve(true)
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
          if (!command.silent) this.bot.client.createMessage(msg.channel.id, ':lock: You do not have permission to use this command')
        }
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  parseFull(msgContent: string): CommandResult {
    let prefix = startsWithAny(msgContent, this.prefixes)
    if (prefix) {
      let result = this.parseContent(msgContent.slice(prefix.length))
      return result
    }
    return new CommandResult(false)
  }

  parseContent(content: string, commands: Command[] = this.elements, parent?: Command): CommandResult {
    let handleCommand = (command: Command, content: string): CommandResult => {
      if (command.args.length > 0) {
        let args = {
          extra: null
        }
        for (let arg of command.args) {
          let types = arg.types
          if (content != null && content.length > 0) {
            let finalResult = new CommandResult(`No suitable arguement was provided for '${arg.name}'\nAcceptable types: [${types.join(', ')}]`)
            for (let type of types) {
              let result = type.validate(content, this.bot)
              if (result.failed) {
                if (types.length === 1) finalResult = new CommandResult(<string>result.data, command)
              } else {
                args[arg.name] = result.data
                if (result.subcontent == null) result.subcontent = ''
                content = result.subcontent.trim()
                finalResult = null
                break
              }
            }
            if (finalResult) {
              if (types.find(type => type === ArgType.ANY)) {
                let parts = content.split(/ (.+)/)
                args[arg.name] = parts[0]
                content = parts[1]
              } else return finalResult
            }
          } else {
            return new CommandResult(`Arguement ${arg.name} was not provided`, command)
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
    return content === '' ?
      parent === null
        ? new CommandResult('No command was provided')
        : new CommandResult(`No subcommand was provided for '${parent.name}'`, parent)
      : new CommandResult(`I'm not sure what you meant by "${content.split(' ')[0]}"`)
  }

  checkPerms(command: Command, userId: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let userTags = await this.bot.userManager.getUserPermTags(userId, true)
      if (userTags.some(tag => tag === 'blacklist')) {
        return resolve(false)
      }
      let commandTags = await command.getPermissions(true)
      let isPrivate = await this.bot.table.getBoolean('private', 'value', true)
      if (commandTags.find(tag => { return userTags.some(tag2 => tag2 === tag) })) {
        if (!(await command.getDefaultPermission(true) && !isPrivate)) return resolve(true)
        else resolve(false)
      } else {
        if (await command.getDefaultPermission(true) && !isPrivate) return resolve(true)
        else resolve(false)
      }
    })
  }
}
