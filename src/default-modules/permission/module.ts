import PermissionManager, { PermMode } from './permission-manager'
import { Module, ModuleConstructionData, ModuleData } from '../../../dist'

export class PermissionModule extends Module {

    permissionManager: PermissionManager

    constructor(data: ModuleConstructionData) {
        super(data, {
            name: "permissions",
            triggers: ["perm", "permissions", "perms"]
        })
        this.permissionManager = new PermissionManager(data.bot)
    }
}

export interface PermissionDataOptions {
    defaultPermission?: boolean
    defaultTags?: string[]
    permMode?: PermMode
}

export {
    PermMode,
    PermissionManager
}
