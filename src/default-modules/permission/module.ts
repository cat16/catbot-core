import { Module, ModuleConstructionData, ModuleData } from "../../../dist";
import PermissionManager, { PermMode } from "./permission-manager";

export class PermissionModule extends Module {

    public permissionManager: PermissionManager;

    constructor(data: ModuleConstructionData) {
        super(data, {
            name: "permissions",
            triggers: ["perm", "permissions", "perms"],
        });
        this.permissionManager = new PermissionManager(data.bot);
    }
}

export interface PermissionDataOptions {
    defaultPermission?: boolean;
    defaultTags?: string[];
    permMode?: PermMode;
}

export {
    PermMode,
    PermissionManager,
};
