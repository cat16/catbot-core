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
        name: 'user',
        subcommands: [
            new index_1.Command({
                name: 'tag',
                subcommands: [
                    new index_1.Command({
                        name: 'add',
                        aliases: ['give'],
                        args: [
                            new index_1.Arg({ name: 'user', types: [index_1.ArgType.USER] }),
                            new index_1.Arg({ name: 'tag' })
                        ],
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            let tags = yield bot.userManager.getUserPermTags(args.user.id, true);
                            if (!tags.some(tag => tag === args.tag)) {
                                tags.push(args.tag);
                                bot.userManager.setUserPermTags(args.user.id, tags).then(() => {
                                    bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave ${args.user.username} tag '${args.tag}'`);
                                });
                            }
                            else {
                                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} already has tag '${args.tag}'`);
                            }
                        })
                    }),
                    new index_1.Command({
                        name: 'remove',
                        aliases: ['take'],
                        args: [
                            new index_1.Arg({ name: 'user', types: [index_1.ArgType.USER] }),
                            new index_1.Arg({ name: 'tag' })
                        ],
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            let tags = yield bot.userManager.getUserPermTags(args.user.id, true);
                            if (tags.some(tag => tag === args.tag)) {
                                tags = tags.filter((tag) => { return tag !== args.tag; });
                                bot.userManager.setUserPermTags(args.user.id, tags).then(() => {
                                    bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from ${args.user.username}`);
                                });
                            }
                            else {
                                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} doesn't have tag '${args.tag}'`);
                            }
                        })
                    }),
                    new index_1.Command({
                        name: 'get',
                        aliases: ['list'],
                        permMode: index_1.PermMode.OVERRIDE,
                        args: [
                            new index_1.Arg({ name: 'user', types: [index_1.ArgType.USER] })
                        ],
                        defaultPermission: true,
                        run: (msg, args, bot) => __awaiter(this, void 0, void 0, function* () {
                            let tags = yield bot.userManager.getUserPermTags(args.user.id, true);
                            if (tags.length < 1) {
                                bot.client.createMessage(msg.channel.id, `${args.user.username} does not have any tags`);
                            }
                            else {
                                bot.client.createMessage(msg.channel.id, `${args.user.username} has the following tags: [${tags.join(', ')}]`);
                            }
                        })
                    })
                ]
            })
        ]
    });
};
