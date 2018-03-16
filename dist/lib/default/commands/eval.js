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
const util = require("util");
exports.default = (bot) => {
    let prepareCode = (code) => {
        return code.toString().replace(bot.config.token, '[TOKEN]').slice(0, 1000);
    };
    const depth = 0;
    /**
     * @param {Message} msg
     * @param {Promise<Message>} sending
     * @param {string} input
     * @param {any} data
     */
    let handleOutput = (msg, sending, input, data) => __awaiter(this, void 0, void 0, function* () {
        let output = data;
        if (typeof (output) !== 'string') {
            output = util.inspect(data, { depth });
        }
        let type = data === null ? 'null'
            : data === undefined ? 'undefined'
                : typeof (data) === 'object' ? 'object - ' + data.constructor.name
                    : typeof (data);
        let promise = output.startsWith('Promise {');
        sending.then(sent => {
            let sending2 = sent.edit({
                content: '',
                embed: {
                    fields: [
                        {
                            name: 'Input',
                            value: '```js\n' + input + '```'
                        },
                        {
                            name: 'Output',
                            value: '```js\n' + prepareCode(output) + '```'
                        },
                        {
                            name: 'Type',
                            value: '```js\n' + type + '```'
                        }
                    ],
                    timestamp: new Date(),
                    color: promise ? 0xffff00 : 0x00ff00
                }
            });
            if (promise) {
                data.then(newData => {
                    handleOutput(msg, sending2, input, newData);
                }, (err) => {
                    outputError(sending2, input, err);
                });
            }
        });
    });
    /**
     * @param {Message} sending
     * @param {string} input
     * @param {Error} err
     */
    let outputError = (sending, input, err) => __awaiter(this, void 0, void 0, function* () {
        (yield sending).edit({
            content: '',
            embed: {
                fields: [
                    {
                        name: 'Input',
                        value: '```js\n' + input + '```'
                    },
                    {
                        name: 'Exception',
                        value: '```js\n' + err.message + '```'
                    },
                    {
                        name: 'Stack',
                        value: '```js\n' + err.stack.slice(0, 1000) + '```'
                    },
                    {
                        name: 'Type',
                        value: '```js\n' + err.name + '```'
                    }
                ],
                timestamp: new Date(),
                color: 0xff0000
            }
        });
    });
    return new index_1.Command({
        name: 'eval',
        run: (msg, content, bot) => __awaiter(this, void 0, void 0, function* () {
            let sending = bot.client.createMessage(msg.channel.id, 'Processing...');
            try {
                Promise.resolve(eval(content)).then(data => {
                    handleOutput(msg, sending, content, data);
                }, err => {
                    outputError(sending, content, err);
                });
            }
            catch (ex) {
                outputError(sending, content, ex);
            }
        })
    });
};
