"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./default/database");
const UTI = database_1.default.users;
const UTIcols = UTI.cols;
class UserManager {
    constructor(dbm) {
        this.table = dbm.tables[UTI.name];
    }
    getUserPermTags(id, ignoreNone = false) {
        return this.table.getStringArray(id, UTIcols.permTags.name, ignoreNone);
    }
    setUserPermTags(id, tags) {
        return this.table.setStringArray(id, {
            name: UTIcols.permTags.name,
            value: tags
        });
    }
    getAdmin(id, ignoreNone = false) {
        return this.table.getBoolean(id, UTIcols.admin.name, ignoreNone);
    }
    setAdmin(id, admin) {
        return this.table.setBoolean(id, {
            name: UTIcols.admin.name,
            value: admin
        });
    }
}
exports.default = UserManager;
