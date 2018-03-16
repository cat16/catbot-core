"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
exports.default = (bot) => {
    return new index_1.Event({
        run: (msg, bot) => {
            if (msg.author.id === bot.client.user.id)
                return;
            bot.commandManager.handleMessage(msg);
        }
    });
};
