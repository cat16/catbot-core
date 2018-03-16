"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SQLError extends Error {
    constructor() {
        super('');
    }
    addSQLMsg(err) {
        this.message = err.message.slice('SQLITE_ERROR: '.length);
        this.stack = `${err.stack}\n\n${this.stack}`;
        return this;
    }
}
exports.default = SQLError;
