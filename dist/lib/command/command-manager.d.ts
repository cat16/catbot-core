import { Message } from 'eris';
import Handler, { ElementSearchResult } from '../handler';
import Command from './command';
import Catbot from '../bot';
import TableManager from '../database/table-manager';
export declare class CommandResult {
    error: boolean;
    data: string | Command | boolean;
    content?: any;
    constructor(data: string | Command | boolean, content?: any);
}
export default class CommandManager extends Handler<Command> {
    push(command: Command): Promise<void>;
    find(content: string, complete?: boolean, commands?: Command[]): ElementSearchResult<Command>;
    prefixes: string[];
    commandTable: TableManager;
    constructor(bot: Catbot);
    load(): void;
    handleMessage(msg: Message): Promise<void>;
    runResult(result: CommandResult, msg: Message, sudo?: boolean): Promise<void>;
    parseFull(msgContent: string): CommandResult;
    parseContent(content: string, commands?: Command[], parent?: Command): CommandResult;
    checkPerms(command: Command, userId: string): Promise<boolean>;
}
