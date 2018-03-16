"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../util/logger");
const database_1 = require("../default/database");
const CTICols = database_1.default.commands.cols;
var PermMode;
(function (PermMode) {
    PermMode["NONE"] = "none";
    PermMode["OVERRIDE"] = "override";
    PermMode["ADD"] = "add";
    PermMode["SUBTRACT"] = "subtract";
})(PermMode = exports.PermMode || (exports.PermMode = {}));
class Command {
    getAllElements() {
        return this.getAllCommands();
    }
    constructor(options) {
        this.name = options.name;
        this.runFunc = options.run;
        this.aliases = options.aliases || [];
        this.subcommands = options.subcommands || [];
        this.defaultPermission = options.defaultPermission || false;
        this.defaultTags = options.defaultTags || [];
        this.args = options.args || [];
        this.silent = options.silent || false;
        this.permMode = options.permMode || PermMode.NONE;
        this.logger = new logger_1.default(`command::uninitialized`);
        this.subcommands.forEach(sc => {
            sc.parent = this;
        });
    }
    run(msg, content, bot) {
        return new Promise((resolve, reject) => {
            if (this.runFunc == null) {
                reject(new Error('no run function provided'));
                return;
            }
            try {
                /** @type {Promise<void>} */
                let result = this.runFunc(msg, content, bot);
                if (result instanceof Promise) {
                    result.then(() => {
                        resolve();
                    }, (reason) => {
                        reject(reason);
                    });
                }
                else {
                    resolve();
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    getTriggers() {
        return [this.name].concat(this.aliases);
    }
    getFullName() {
        return this.parent == null ? this.name : `${this.parent.getFullName()} ${this.name}`;
    }
    load(logger, table, force = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger = new logger_1.default(`command::${this.getFullName()}`, logger);
            this.commandTable = table;
            if (force || (yield this.getPermMode()) == null)
                yield this.setPermMode(this.permMode);
            if (force || (yield this.getPermissions()) == null)
                yield this.setPermissions(this.defaultTags);
            if (force || (yield this.getDefaultPermission()) == null)
                yield this.setDefaultPermission(this.defaultPermission);
            if (this.subcommands.length > 0) {
                let loaded = 0;
                this.subcommands.forEach(sc => {
                    sc.load(logger, table, force).then(() => {
                        loaded++;
                        if (loaded === this.subcommands.length)
                            resolve();
                    });
                });
            }
            else {
                resolve();
            }
        }));
    }
    getAllCommands() {
        let commands = [].concat.apply([], this.subcommands.map(sc => sc.getAllCommands()));
        if (this.runFunc != null)
            commands.push(this);
        return commands;
    }
    // Database functions
    getPermissions(ignoreNone = false, ignoreMode = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let permMode = yield this.getPermMode(true);
            let thisPerms = yield this.commandTable.getStringArray(this.getFullName(), CTICols.permissions.name, ignoreNone);
            if (permMode === PermMode.OVERRIDE || this.parent == null || ignoreMode) {
                resolve(thisPerms);
            }
            else {
                let parentPerms = yield this.parent.getPermissions(ignoreNone);
                switch (permMode) {
                    case PermMode.NONE:
                        resolve(parentPerms);
                        break;
                    case PermMode.ADD:
                        resolve(thisPerms == null ? parentPerms : parentPerms == null ? thisPerms : thisPerms.concat(parentPerms));
                        break;
                    case PermMode.SUBTRACT:
                        resolve(thisPerms == null ? parentPerms : parentPerms == null ? null : parentPerms.filter(perm => !thisPerms.some(perm2 => perm2 === perm)));
                        break;
                    default:
                        reject(new Error('Perm mode was not set valid!'));
                }
            }
        }));
    }
    setPermissions(permissions) {
        return this.commandTable.setStringArray(this.getFullName(), {
            name: CTICols.permissions.name,
            value: permissions
        });
    }
    getDefaultPermission(ignoreNone = false, ignoreParent = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let defPerm = yield this.commandTable.getBoolean(this.getFullName(), CTICols.defaultPermission.name);
            if (defPerm == null && this.parent != null && !ignoreParent) {
                resolve(this.parent.getDefaultPermission());
            }
            else {
                resolve(defPerm == null ? (ignoreNone ? false : null) : defPerm);
            }
        }));
    }
    setDefaultPermission(defaultPermission) {
        return this.commandTable.setBoolean(this.getFullName(), {
            name: CTICols.defaultPermission.name,
            value: defaultPermission
        });
    }
    getPermMode(ignoreNone = true) {
        return this.commandTable.get(this.getFullName(), CTICols.permMode.name, ignoreNone ? PermMode.NONE : null);
    }
    setPermMode(permMode) {
        return this.commandTable.set(this.getFullName(), {
            name: CTICols.permMode.name,
            value: permMode
        });
    }
}
exports.default = Command;
