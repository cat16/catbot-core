import { Message } from 'eris'

import { Element } from '../handler'
import Arg from './arg'
import Logger from '../util/logger'
import Catbot from '../bot'
import TABLES from '../default/database'
const CTICols = TABLES.commands.cols
import TableManager from '../database/table-manager'

export interface Args {
  extra: string
}

export type RunFunction = (msg: Message, content: string | Args | any, bot: Catbot) => {}

export interface CommandOptions {
  name: string
  run?: RunFunction
  aliases?: string[]
  subcommands?: Command[]
  defaultPermission?: boolean
  defaultTags?: string[]
  args?: Arg[]
  silent?: boolean
  permMode?: PermMode
}

export enum PermMode {
  NONE = 'none',
  OVERRIDE = 'override',
  ADD = 'add',
  SUBTRACT = 'subtract'
}

export default class Command implements Element {

  path: string
  isDefault: boolean
  fileName: string

  getAllElements() {
    return this.getAllCommands()
  }

  name: string
  runFunc?: RunFunction

  aliases: string[]
  subcommands: Command[]
  defaultPermission: boolean
  defaultTags: string[]
  args: Arg[]
  silent: boolean
  permMode: PermMode

  logger: Logger
  parent: Command
  commandTable: TableManager

  constructor(options: CommandOptions) {
    this.name = options.name
    this.runFunc = options.run

    this.aliases = options.aliases || []
    this.subcommands = options.subcommands || []
    this.defaultPermission = options.defaultPermission || false
    this.defaultTags = options.defaultTags || []
    this.args = options.args || []
    this.silent = options.silent || false
    this.permMode = options.permMode || PermMode.NONE

    this.logger = new Logger(`command::uninitialized`)
    this.subcommands.forEach(sc => {
      sc.parent = this
    })
  }

  run(msg: Message, content: string, bot: Catbot): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.runFunc == null) {
        reject(new Error('no run function provided'))
        return
      }
      try {
        /** @type {Promise<void>} */
        let result = this.runFunc(msg, content, bot)
        if (result instanceof Promise) {
          result.then(() => {
            resolve()
          }, (reason) => {
            reject(reason)
          })
        } else {
          resolve()
        }
      } catch (ex) {
        reject(ex)
      }
    })
  }

  getTriggers(): string[] {
    return [this.name].concat(this.aliases)
  }

  getFullName(): string {
    return this.parent == null ? this.name : `${this.parent.getFullName()} ${this.name}`
  }

  load(logger: Logger, table: TableManager, force: boolean = false): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger(`command::${this.getFullName()}`, logger)
      this.commandTable = table
      if (force || await this.getPermMode() == null) await this.setPermMode(this.permMode)
      if (force || await this.getPermissions() == null) await this.setPermissions(this.defaultTags)
      if (force || await this.getDefaultPermission() == null) await this.setDefaultPermission(this.defaultPermission)
      if (this.subcommands.length > 0) {
        let loaded = 0
        this.subcommands.forEach(sc => {
          sc.load(logger, table, force).then(() => {
            loaded++
            if (loaded === this.subcommands.length) resolve()
          })
        })
      } else {
        resolve()
      }
    })
  }

  getAllCommands(): Command[] {
    let commands = [].concat.apply([], this.subcommands.map(sc => sc.getAllCommands()))
    if (this.runFunc != null) commands.push(this)
    return commands
  }

  // Database functions

  getPermissions(ignoreNone: boolean = false, ignoreMode: boolean = false): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      let permMode = await this.getPermMode(true)
      let thisPerms = await this.commandTable.getStringArray(
        this.getFullName(), CTICols.permissions.name, ignoreNone
      )
      if (permMode === PermMode.OVERRIDE || this.parent == null || ignoreMode) {
        resolve(thisPerms)
      } else {
        let parentPerms = await this.parent.getPermissions(ignoreNone)
        switch (permMode) {
          case PermMode.NONE:
            resolve(parentPerms)
            break
          case PermMode.ADD:
            resolve(thisPerms == null ? parentPerms : parentPerms == null ? thisPerms : thisPerms.concat(parentPerms))
            break
          case PermMode.SUBTRACT:
            resolve(thisPerms == null ? parentPerms : parentPerms == null ? null : parentPerms.filter(perm => !thisPerms.some(perm2 => perm2 === perm)))
            break
          default:
            reject(new Error('Perm mode was not set valid!'))
        }
      }
    })
  }

  setPermissions(permissions: string[]): Promise<void> {
    return this.commandTable.setStringArray(
      this.getFullName(),
      {
        name: CTICols.permissions.name,
        value: permissions
      }
    )
  }

  getDefaultPermission(ignoreNone: boolean = false, ignoreParent: boolean = false): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let defPerm = await this.commandTable.getBoolean(
        this.getFullName(),
        CTICols.defaultPermission.name
      )
      if (defPerm == null && this.parent != null && !ignoreParent) {
        resolve(this.parent.getDefaultPermission())
      } else {
        resolve(defPerm == null ? (ignoreNone ? false : null) : defPerm)
      }
    })
  }

  setDefaultPermission(defaultPermission: boolean): Promise<void> {
    return this.commandTable.setBoolean(
      this.getFullName(),
      {
        name: CTICols.defaultPermission.name,
        value: defaultPermission
      }
    )
  }

  getPermMode(ignoreNone: boolean = true): Promise<PermMode> {
    return this.commandTable.get(
      this.getFullName(),
      CTICols.permMode.name,
      ignoreNone ? PermMode.NONE : null
    )
  }

  setPermMode(permMode: string): Promise<void> {
    return this.commandTable.set(
      this.getFullName(),
      {
        name: CTICols.permMode.name,
        value: permMode
      }
    )
  }
}
