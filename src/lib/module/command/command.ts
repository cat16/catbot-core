import { Message, MessageContent } from 'eris'

import { RecursiveElement, ElementConstructionData } from '../element'
import Arg from './arg'
import Logger from '../../util/logger'
import Catbot from '../../bot'
import Module from '../module';

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

  public bot: Catbot
  public msg: Message
  public args: ArgList

  constructor(bot, msg, args: ArgList) {
    this.bot = bot
    this.msg = msg
    this.args = args
  }

  say(msg: MessageContent): Promise<Message> {
    return this.bot.client.createMessage(this.msg.channel.id, msg)
  }
}

export abstract class ModuleData {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

export interface CommandConstructionData extends ElementConstructionData {
  logger?: Logger
}

export interface CommandOptions {
  name: string
  aliases?: string[]
  args?: Arg[]
  silent?: boolean
}

export default abstract class Command extends RecursiveElement {

  name: string

  aliases: string[]
  subcommands: this[]
  args: Arg[]
  silent: boolean
  module: Module

  logger: Logger
  parent: Command

  private currentMsg: Message

  constructor(data: CommandConstructionData, options: CommandOptions) {
    super(data)
    this.name = options.name

    this.aliases = options.aliases || []
    this.subcommands = []
    this.args = options.args || []
    this.silent = options.silent || false
    this.module = null

    this.logger = new Logger(`command::${this.getName()}`, data.logger)
    this.subcommands.forEach(sc => {
      sc.parent = this
    })
  }

  getAllElements(includeEmpty: boolean = false) {
    return this.getAllCommands(includeEmpty)
  }

  getName(): string {
    return this.parent == null ? this.name : `${this.parent.getName()} ${this.name}`
  }

  addSubElement(element: this) {
    this.subcommands.push(element)
  }

  getSubElements(): this[] {
    return this.subcommands
  }

  getAliases(): string[] {
    return this.aliases
  }

  getTriggers(): string[] {
    return [this.name].concat(this.aliases)
  }

  getAllCommands(includeEmpty: boolean = false): Command[] {
    let commands = [].concat.apply([], this.subcommands.map(sc => sc.getAllCommands()))
    if (includeEmpty) commands.push(this)
    return commands
  }
}

export abstract class RunnableCommand extends Command {
  abstract run(data: CommandContext): void
  async hasPermission(context: CommandContext): Promise<boolean> {
    return false
  }
}

export class CommandGroup extends Command {

  constructor(name: string, data: ElementConstructionData) {
    super(data, {
      name: name
    })
  }

  getAliases() {
    return [this.name]
  }

}
