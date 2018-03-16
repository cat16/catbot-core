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
        name: 'ping',
        defaultPermission: true,
        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
            let now = new Date();
            let sent = yield bot.client.createMessage(msg.channel.id, 'Ping: loading...');
            let then = new Date();
            sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`);
        })
    });
};
