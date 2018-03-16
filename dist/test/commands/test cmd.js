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
const index_1 = require("../../index");
exports.default = (bot) => {
    bot.temp.testCommand = { userMap: {} };
    return new index_1.Command({
        name: 'test command',
        aliases: ['test'],
        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
            bot.commandManager.runResult(bot.commandManager.parseContent(content, bot.commandManager.elements), msg);
            bot.temp.testCommand.userMap[msg.author.id] = content;
        }),
        subcommands: [
            new index_1.Command({
                name: 'again',
                run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
                    let temp = bot.temp.testCommand;
                    if (temp.userMap[msg.author.id] == null) {
                        bot.client.createMessage(msg.channel.id, 'No previous commands were tested');
                    }
                    else {
                        bot.restart(true).then(() => {
                            bot.temp.testCommand = temp;
                            bot.commandManager.runResult(bot.commandManager.parseContent(temp.userMap[msg.author.id]), msg);
                        }, (err) => {
                            bot.client.createMessage(msg.channel.id, err);
                        });
                    }
                })
            })
        ]
    });
};
