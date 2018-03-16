"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
const index_1 = require("../index");
let bot = new index_1.Catbot(__dirname);
bot.start();
