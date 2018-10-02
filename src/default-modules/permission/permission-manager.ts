import { Command, Bot } from '../../index'
import { CommandOrGroup } from '../../lib/module/command/command'
import { Collection } from 'mongodb'

export enum PermMode {
    NONE = 'none',
    OVERRIDE = 'override',
    ADD = 'add',
    SUBTRACT = 'subtract'
}

export class CommandPermissionManager {

    private collection: Collection
    private command: Command

    constructor(collection: Collection, command: Command) {
        this.collection = collection
        this.command = command
    }

    private getValue(key: string): Promise<any> {
        return this.collection.findOne({key: 'commands'})[this.command.name]
    }

    getPermissions(ignoreNone: boolean = false, ignoreMode: boolean = false): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            let permMode = await this.getPermMode(this.command, true)
            let thisPerms = await this.getValue('permissions')
            if (permMode === PermMode.OVERRIDE || this.command.getParent() == null || ignoreMode) {
                resolve(thisPerms)
            } else {
                let parentPerms = await this.getPermissions(ignoreNone)
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

    setPermissions(command: CommandOrGroup, permissions: string[]): Promise<void> {
        return this.table.setStringArray(
            command.getName(),
            {
                name: CTICols.permissions.name,
                value: permissions
            }
        )
    }

    getDefaultPermission(command: CommandOrGroup, ignoreNone: boolean = false, ignoreParent: boolean = false): Promise<boolean> {
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

    setDefaultPermission(command: CommandOrGroup, defaultPermission: boolean): Promise<void> {
        return this.table.setBoolean(
            command.getName(),
            {
                name: CTICols.defaultPermission.name,
                value: defaultPermission
            }
        )
    }

    getPermMode(command: CommandOrGroup, ignoreNone: boolean = true): Promise<PermMode> {
        return this.table.get(
            command.getName(),
            CTICols.permMode.name,
            ignoreNone ? PermMode.NONE : null
        )
    }

    setPermMode(command: CommandOrGroup, permMode: string): Promise<void> {
        return this.table.set(
            command.getName(),
            {
                name: CTICols.permMode.name,
                value: permMode
            }
        )
    }
}

export default class PermissionManager {

    private commandCollection: Collection

    constructor(bot: Bot) {
        this.commandCollection = bot.db().collection('command-permissions')
    }

    command(command: Command): CommandPermissionManager {
        return new CommandPermissionManager(this.commandCollection, command)
    }

    checkPerms(command: CommandOrGroup, userId: string): Promise<boolean> {
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
}