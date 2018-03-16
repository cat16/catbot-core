"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(options = {}) {
        this.token = options.token;
        this.ownerID = options.ownerID;
        this.defaultPrefix = options.defaultPrefix;
        this.generateFolders = options.generateFolders || true;
    }
}
exports.default = Config;
