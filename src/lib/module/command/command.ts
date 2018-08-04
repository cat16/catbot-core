import { Message, MessageContent } from 'eris'

import { RecursiveElement, RecursiveElementLoader, ElementGroup } from '../../handler'
import Arg from './arg'
import Logger from '../../util/logger'
import Bot from '../../bot'
import Module from '../module'

export class ArgList {

  private args: Map<string, any>
  public content: string

  constructor(args: Map<string, any>, content: string) {
    this.args = args
    this.content = content
  }

  get(arg: string): any {
    return this.args.get(arg)
  }
}

export class CommandContext {

  public bot: Bot
  public msg: Message
  public args: ArgList

  constructor(bot, msg, args: ArgList) {
    this.bot = bot
    this.msg = msg
    this.args = args
  }

  say(msg: MessageContent): Promise<Message> {
    return this.msg.channel.createMessage(msg)
  }
}

export abstract class ModuleData {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

export interface CommandOptions {
  name: string
  aliases?: string[]
  args?: Arg[]
  silent?: boolean
}

export interface CommandConstructionData {
  bot: Bot,
  manager: RecursiveElementLoader<Command>,
  parent?: Command
}

export type CommandOrGroup = Command | ElementGroup<Command>

//TODO: Make more things private
export default abstract class Command implements RecursiveElement {

  name: string

  private aliases: string[]
  private manager: RecursiveElementLoader<Command>
  args: Arg[]
  silent: boolean
  private module: Module

  logger: Logger
  private parent?: Command

  private currentMsg: Message

  constructor(data: CommandConstructionData, options: CommandOptions) {
    this.name = options.name

    this.aliases = options.aliases || []
    this.manager = data.manager
    this.args = options.args || []
    this.silent = options.silent || false
    this.parent = data.parent
    this.module = null

    this.logger = new Logger(`command::${this.getName()}`, data.bot.getLogger())
  }

  abstract run(data: CommandContext): void
  hasPermission(context: CommandContext): Promise<boolean> | boolean {
    return false
  }

  getElementManager(): RecursiveElementLoader<Command> {
    return this.manager
  }

  getParent(): Command {
    return this.parent
  }

  getName(): string {
    return this.parent == null ? this.name : `${this.parent.getName()} ${this.name}`
  }

  getSubcommands(): CommandOrGroup[] {
    return this.manager.getAllElements()
  }

  getAliases(): string[] {
    return this.aliases
  }

  getTriggers(): string[] {
    return [this.name].concat(this.aliases)
  }

  getModule(): Module {
    return this.module
  }
}
