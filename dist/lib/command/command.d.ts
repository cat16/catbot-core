import { Message } from 'eris';
import { Element } from '../handler';
import Arg from './arg';
import Logger from '../util/logger';
import Catbot from '../bot';
import TableManager from '../database/table-manager';
export interface Args {
    extra: string;
}
export declare type RunFunction = (msg: Message, content: string | Args | any, bot: Catbot) => {};
export interface CommandOptions {
    name: string;
    run?: RunFunction;
    aliases?: string[];
    subcommands?: Command[];
    defaultPermission?: boolean;
    defaultTags?: string[];
    args?: Arg[];
    silent?: boolean;
    permMode?: PermMode;
}
export declare enum PermMode {
    NONE = "none",
    OVERRIDE = "override",
    ADD = "add",
    SUBTRACT = "subtract",
}
export default class Command implements Element {
    path: string;
    isDefault: boolean;
    fileName: string;
    getAllElements(): Command[];
    name: string;
    runFunc?: RunFunction;
    aliases: string[];
    subcommands: Command[];
    defaultPermission: boolean;
    defaultTags: string[];
    args: Arg[];
    silent: boolean;
    permMode: PermMode;
    logger: Logger;
    parent: Command;
    commandTable: TableManager;
    constructor(options: CommandOptions);
    run(msg: Message, content: string, bot: Catbot): Promise<void>;
    getTriggers(): string[];
    getFullName(): string;
    load(logger: Logger, table: TableManager, force?: boolean): Promise<void>;
    getAllCommands(): Command[];
    getPermissions(ignoreNone?: boolean, ignoreMode?: boolean): Promise<string[]>;
    setPermissions(permissions: string[]): Promise<void>;
    getDefaultPermission(ignoreNone?: boolean, ignoreParent?: boolean): Promise<boolean>;
    setDefaultPermission(defaultPermission: boolean): Promise<void>;
    getPermMode(ignoreNone?: boolean): Promise<PermMode>;
    setPermMode(permMode: string): Promise<void>;
}
