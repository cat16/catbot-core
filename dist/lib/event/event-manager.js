"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("../handler");
const logger_1 = require("../util/logger");
class EventManager extends handler_1.default {
    push(event) {
        return new Promise((resolve, reject) => {
            this.elements.push(event);
            this.bot.client.on(event.fileName, data => { event.run(data, this.bot); });
            resolve();
        });
    }
    find(content) {
        return { element: this.elements.find(e => e.fileName === content), content };
    }
    constructor(bot) {
        super(bot, new logger_1.default('event-manager', bot.logger), 'event');
    }
}
exports.default = EventManager;
