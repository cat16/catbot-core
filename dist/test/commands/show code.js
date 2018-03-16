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
const CODE_LENGTH = 1900;
exports.default = (bot) => {
    return new index_1.Command({
        name: 'show code',
        aliases: ['share', 'share code'],
        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
            let path = content;
            /** @type {string} */
            let code = require(path).toString();
            for (let i = 0; i < code.length; i += CODE_LENGTH) {
                let start = i;
                let end = i + CODE_LENGTH;
                if (code.substring(end).length > 0)
                    while (code.substring(end, end + 1) !== '\n')
                        end--;
                bot.client.createMessage(msg.channel.id, `\`\`\`js\n${code.substring(start, end)}\n\`\`\``);
                i -= end - CODE_LENGTH - i;
            }
        })
    });
};
