import { Command, Bot } from '../../../index'
import TABLES from './database'
import TableManager from '../../database/table-manager'
const CTICols = TABLES.commands.cols

export enum PermMode {
    NONE = 'none',
    OVERRIDE = 'override',
    ADD = 'add',
    SUBTRACT = 'subtract'
}

export default class PermissionManager {

    bot: Bot
    table: TableManager

    constructor(bot: Bot, table: TableManager) {
        this.bot = bot
        this.table = table
    }

    load(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            for (let command of this.bot.getCommandManager().getAllElements()) {
                this.loadCommandPerms(command)
            }
        })
    }

    loadCommandPerms(command: Command, force: boolean = false): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let data = command.getModuleData('permissions')
            if (force || await this.getPermMode(command) == null)
                await this.setPermMode(command, command.moduleData.permMode)
            if (force || await this.getPermissions(command) == null)
                await this.setPermissions(command, command.defaultTags)
            if (force || await this.getDefaultPermission(command) == null)
                await this.setDefaultPermission(command, command.defaultPermission)
            resolve()
        })
    }

    checkPerms(command: Command, userId: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
          let userTags = await this.bot.userManager.getUserPermTags(userId, true)
          if (userTags.some(tag => tag === 'blacklist')) {
            return resolve(false)
          }
          let commandTags = await this.getPermissions(command, true)
          let isPrivate = await this.bot.table.getBoolean('private', 'value', true) && command.getName() !== 'sudo'
          if (commandTags.find(tag => { return userTags.some(tag2 => tag2 === tag) })) {
            if (!(await this.getDefaultPermission(command, true) && !isPrivate)) return resolve(true)
            else resolve(false)
          } else {
            if (await this.getDefaultPermission(command, true) && !isPrivate) return resolve(true)
            else resolve(false)
          }
        })
      }

    getPermissions(command: Command, ignoreNone: boolean = false, ignoreMode: boolean = false): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            let permMode = await this.getPermMode(command, true)
            let thisPerms = await this.table.getStringArray(
                command.getName(), CTICols.permissions.name, ignoreNone
            )
            if (permMode === PermMode.OVERRIDE || command.parent == null || ignoreMode) {
                resolve(thisPerms)
            } else {
                let parentPerms = await this.getPermissions(command.parent, ignoreNone)
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

    setPermissions(command: Command, permissions: string[]): Promise<void> {
        return this.table.setStringArray(
            command.getName(),
            {
                name: CTICols.permissions.name,
                value: permissions
            }
        )
    }

    getDefaultPermission(command: Command, ignoreNone: boolean = false, ignoreParent: boolean = false): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let defPerm = await this.table.getBoolean(
                command.getName(),
                CTICols.defaultPermission.name
            )
            if (defPerm == null && command.parent != null && !ignoreParent) {
                resolve(this.getDefaultPermission(command.parent))
            } else {
                resolve(defPerm == null ? (ignoreNone ? false : null) : defPerm)
            }
        })
    }

    setDefaultPermission(command: Command, defaultPermission: boolean): Promise<void> {
        return this.table.setBoolean(
            command.getName(),
            {
                name: CTICols.defaultPermission.name,
                value: defaultPermission
            }
        )
    }

    getPermMode(command: Command, ignoreNone: boolean = true): Promise<PermMode> {
        return this.table.get(
            command.getName(),
            CTICols.permMode.name,
            ignoreNone ? PermMode.NONE : null
        )
    }

    setPermMode(command: Command, permMode: string): Promise<void> {
        return this.table.set(
            command.getName(),
            {
                name: CTICols.permMode.name,
                value: permMode
            }
        )
    }
}