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
const index_1 = require("../../../index");
exports.default = (bot) => {
    return new index_1.Command({
        name: 'command',
        subcommands: [
            new index_1.Command({
                name: 'reload',
                run: (msg, content, bot) => {
                    return new Promise((resolve, reject) => {
                        let sentp = bot.client.createMessage(msg.channel.id, `Reloading command ${content}...`);
                        bot.commandManager.reloadElement(content).then(() => {
                            sentp.then(sent => sent.edit(`:white_check_mark: Command \`${content}\` reloaded`));
                            resolve();
                        }, reject);
                    });
                },
                subcommands: [
                    new index_1.Command({
                        name: 'all',
                        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                            let sentp = bot.client.createMessage(msg.channel.id, 'Reloading all commands...');
                            yield bot.commandManager.reload();
                            sentp.then(sent => sent.edit(':white_check_mark: Commands reloaded'));
                        })
                    })
                ]
            }),
            new index_1.Command({
                name: 'permission',
                aliases: ['perm', 'perms', 'permissions'],
                subcommands: [
                    new index_1.Command({
                        name: 'add',
                        aliases: ['give'],
                        args: [
                            new index_1.Arg({ name: 'command', types: [index_1.ArgType.COMMAND] }),
                            new index_1.Arg({ name: 'tag' })
                        ],
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            /** @type {Command} */
                            let command = args.command;
                            let tags = yield command.getPermissions(true);
                            if (!tags.includes(args.tag)) {
                                tags.push(args.tag);
                                command.setPermissions(tags).then(() => {
                                    bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave command \`${command.getFullName()}\` tag '${args.tag}'`);
                                });
                            }
                            else {
                                bot.client.createMessage(msg.channel.id, `:x: Command \`${command.getFullName()}\` already has tag '${args.tag}'`);
                            }
                        })
                    }),
                    new index_1.Command({
                        name: 'remove',
                        aliases: ['take'],
                        args: [
                            new index_1.Arg({ name: 'command', types: [index_1.ArgType.COMMAND] }),
                            new index_1.Arg({ name: 'tag' })
                        ],
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            /** @type {Command} */
                            let command = args.command;
                            let tags = yield command.getPermissions(true);
                            if (tags.includes(args.tag)) {
                                tags = tags.filter((tag) => { return tag !== args.tag; });
                                command.setPermissions(tags).then(() => {
                                    bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from command \`${command.getFullName()}\``);
                                });
                            }
                            else {
                                bot.client.createMessage(msg.channel.id, `:x: Command \`${command.getFullName()}\` doesn't have tag '${args.tag}'`);
                            }
                        })
                    }),
                    new index_1.Command({
                        name: 'get',
                        aliases: ['list'],
                        permMode: index_1.PermMode.OVERRIDE,
                        args: [
                            new index_1.Arg({ name: 'command', types: [index_1.ArgType.COMMAND] })
                        ],
                        defaultPermission: true,
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            /** @type {Command} */
                            let command = args.command;
                            let baseTags = yield command.getPermissions(true, true);
                            let tags = yield command.getPermissions(true);
                            let send = '';
                            if (baseTags.length === 0) {
                                send += `\`${command.getFullName()}\` does not have any tags\n`;
                            }
                            else {
                                send += `\`${command.getFullName()}\` has the following tags: [${baseTags.join(', ')}]\n`;
                            }
                            if (tags.length === 0) {
                                send += `With perm mode \`${yield command.getPermMode(true)}\`, it does not have any tags`;
                            }
                            else {
                                send += `With perm mode \`${yield command.getPermMode(true)}\`, it has the following tags: [${tags.join(', ')}]`;
                            }
                            bot.client.createMessage(msg.channel.id, send);
                        })
                    })
                ]
            }),
            new index_1.Command({
                name: 'reset',
                args: [new index_1.Arg({ name: 'command', types: [index_1.ArgType.COMMAND] })],
                run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                    /** @type {Command} */
                    let command = args.command;
                    let sentp = bot.client.createMessage(msg.channel.id, `Resetting command \`${command.getFullName()}\`...`);
                    yield command.load(bot.logger, command.commandTable, true);
                    sentp.then(sent => sent.edit(`:white_check_mark: Successfully reset command \`${command.getFullName()}\``));
                })
            })
        ]
    });
};
