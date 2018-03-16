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
        name: 'bot',
        subcommands: [
            new index_1.Command({
                name: 'restart',
                run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                    let sentp = bot.client.createMessage(msg.channel.id, 'Restarting...');
                    yield bot.restart();
                    sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'));
                }),
                subcommands: [
                    new index_1.Command({
                        name: 'full',
                        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                            let sentp = bot.client.createMessage(msg.channel.id, 'Restarting...');
                            yield bot.restart(true);
                            sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'));
                        })
                    })
                ]
            }),
            new index_1.Command({
                name: 'invite',
                run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                    bot.client.createMessage(msg.channel.id, `Invite: https://discordapp.com/oauth2/authorize?client_id=${bot.client.user.id}&permissions=0&scope=bot`);
                })
            }),
            new index_1.Command({
                name: 'stop',
                run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                    yield bot.client.createMessage(msg.channel.id, 'Stopping...');
                    bot.stop();
                })
            })
        ]
    });
};
