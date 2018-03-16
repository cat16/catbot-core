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
const handler_1 = require("../handler");
const command_1 = require("./command");
const arg_1 = require("./arg");
const logger_1 = require("../util/logger");
const database_1 = require("../default/database");
const CTI = database_1.default.commands;
class CommandResult {
    constructor(data, content) {
        this.error = typeof (data) === 'boolean' ? data : !(data instanceof command_1.default);
        this.data = data;
        this.content = content;
    }
}
exports.CommandResult = CommandResult;
let startsWithAny = (str, arr) => {
    let longest = '';
    arr.forEach(str2 => {
        if (str2.length > longest.length && str.startsWith(str2))
            longest = str2;
    });
    return longest.length === 0 ? null : longest;
};
class CommandManager extends handler_1.default {
    push(command) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield command.load(this.logger, this.commandTable).catch(err => reject(err));
            if (!this.elements.some((cmd, index) => {
                if (cmd.name === command.name) {
                    if (cmd.isDefault) {
                        this.elements.splice(index, 1);
                    }
                    else {
                        reject(new Error(`Conflicting commands found: There are 2 commands with the name '${command.name}'`));
                        return true;
                    }
                }
                return false;
            }))
                this.elements.push(command);
            resolve();
        }));
    }
    find(content, complete = false, commands = this.elements) {
        let result = null;
        commands.find(c => {
            return c.getTriggers().find(alias => {
                if (content.startsWith(alias)) {
                    content = content.slice(alias.length).trimLeft();
                    if (c.subcommands.length > 0) {
                        result = this.find(content, complete, c.subcommands);
                        if (result == null && (!complete || c.runFunc != null))
                            result = { element: c, content };
                    }
                    else
                        result = { element: c, content };
                    return true;
                }
            }) !== undefined;
        });
        return result;
    }
    constructor(bot) {
        super(bot, new logger_1.default('command-manager', bot.logger), 'command');
        this.prefixes = [bot.config.defaultPrefix];
    }
    load() {
        this.commandTable = this.bot.databaseManager.tables[CTI.name];
    }
    handleMessage(msg) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.parseFull(msg.content);
            yield this.runResult(result, msg);
            resolve();
        }));
    }
    runResult(result, msg, sudo = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let silent = yield this.bot.table.getBoolean('silent', 'value', true);
            if (result.error) {
                if (!silent)
                    this.bot.client.createMessage(msg.channel.id, result.data);
            }
            else if (result.data instanceof command_1.default) {
                let command = result.data;
                if (sudo || (yield this.checkPerms(command, msg.author.id))) {
                    command.run(msg, result.content, this.bot).then(() => {
                        if (!command.silent)
                            this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' ran command '${command.getFullName()}'`);
                    }, (err) => {
                        this.logger.error(`Command '${command.getFullName()}' crashed: ${err.stack}`);
                    });
                }
                else {
                    this.logger.log(`'${msg.author.username}#${msg.author.discriminator}' did not have permission to run command '${command.getFullName()}'`);
                    if (!command.silent)
                        this.bot.client.createMessage(msg.channel.id, ':lock: You do not have permission to use this command');
                }
            }
            resolve();
        }));
    }
    parseFull(msgContent) {
        let prefix = startsWithAny(msgContent, this.prefixes);
        if (prefix) {
            let result = this.parseContent(msgContent.slice(prefix.length));
            return result;
        }
        return new CommandResult(false);
    }
    parseContent(content, commands = this.elements, parent) {
        let handleCommand = (command, content) => {
            if (command.args.length > 0) {
                let args = {
                    extra: null
                };
                for (let arg of command.args) {
                    let types = arg.types;
                    if (content != null && content.length > 0) {
                        let finalResult = new CommandResult(`No suitable arguement was provided for '${arg.name}'\nAcceptable types: [${types.join(', ')}]`);
                        for (let type of types) {
                            let result = type.validate(content, this.bot);
                            if (result.failed) {
                                if (types.length === 1)
                                    finalResult = new CommandResult(result.data);
                            }
                            else {
                                args[arg.name] = result.data;
                                if (result.subcontent == null)
                                    result.subcontent = '';
                                content = result.subcontent.trim();
                                finalResult = null;
                                break;
                            }
                        }
                        if (finalResult) {
                            if (types.find(type => type === arg_1.ArgType.ANY)) {
                                let parts = content.split(/ (.+)/);
                                args[arg.name] = parts[0];
                                content = parts[1];
                            }
                            else
                                return finalResult;
                        }
                    }
                    else {
                        return new CommandResult(`Arguement ${arg.name} was not provided`);
                    }
                }
                args.extra = content;
                return new CommandResult(command, args);
            }
            else {
                return new CommandResult(command, content);
            }
        };
        for (let command of commands) {
            let alias = startsWithAny(content, command.getTriggers());
            if (alias) {
                let subcontent = content.slice(alias.length).trimLeft();
                if (command.subcommands.length > 0) {
                    let result = this.parseContent(subcontent, command.subcommands, command);
                    if (result.error && command.runFunc != null)
                        return handleCommand(command, subcontent);
                    else
                        return result;
                }
                else if (command.runFunc != null) {
                    return handleCommand(command, subcontent);
                }
                else {
                    this.logger.warn(`Command '${command.name}' has nothing to run!`);
                }
            }
        }
        if (content === '')
            return parent === null ? new CommandResult('No command was provided') : new CommandResult(`No subcommand was provided for '${parent.name}'`);
        else
            return new CommandResult(`I'm not sure what you meant by "${content.split(' ')[0]}"`);
    }
    checkPerms(command, userId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let userTags = yield this.bot.userManager.getUserPermTags(userId, true);
            if (userTags.some(tag => tag === 'blacklist')) {
                return resolve(false);
            }
            let commandTags = yield command.getPermissions(true);
            let isPrivate = yield this.bot.table.getBoolean('private', 'value', true);
            if (commandTags.find(tag => { return userTags.some(tag2 => tag2 === tag); })) {
                if (!((yield command.getDefaultPermission(true)) && !isPrivate))
                    return resolve(true);
                else
                    resolve(false);
            }
            else {
                if ((yield command.getDefaultPermission(true)) && !isPrivate)
                    return resolve(true);
                else
                    resolve(false);
            }
        }));
    }
}
exports.default = CommandManager;
