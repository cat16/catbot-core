"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Column {
    constructor(options) {
        this.name = options.name;
        this.value = options.value;
    }
}
exports.Column = Column;
class ColumnInfo {
    constructor(options) {
        this.name = options.name;
        this.type = options.type;
        this.unique = options.unique || false;
    }
}
exports.ColumnInfo = ColumnInfo;
