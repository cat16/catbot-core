"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let twoDigit = (num) => {
    return num.length === 1 ? `0${num}` : num;
};
var MsgType;
(function (MsgType) {
    MsgType["INFO"] = "info";
    MsgType["WARN"] = "warn";
    MsgType["ERROR"] = "error";
    MsgType["DEBUG"] = "debug";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
class Logger {
    constructor(name, parent, field) {
        this.name = parent == null ? name : `${parent.name}->${name}`;
        this.name = field == null ? name : `${name}::${field}`;
    }
    getLogString(msg, type = MsgType.INFO) {
        let d = new Date();
        let year = `${d.getFullYear()}`;
        let month = `${d.getMonth() + 1}`;
        let day = `${d.getDate()}`;
        let hour = `${d.getHours()}`;
        let min = `${d.getMinutes()}`;
        let sec = `${d.getSeconds()}`;
        month = twoDigit(month);
        day = twoDigit(day);
        hour = twoDigit(hour);
        sec = twoDigit(sec);
        let date = `${day}-${month}-${year}|${hour}:${min}:${sec}`;
        return `[${date}] [${this.name}] [${type}] ${msg}`;
    }
    /**
     * outputs info about what has happened or is going to happen
     */
    info(msg) {
        this.log(msg, MsgType.INFO);
    }
    /**
     * outputs a warning about something that happened
     */
    warn(msg) {
        this.log(msg, MsgType.WARN);
    }
    /**
     * outputs an error
     */
    error(msg) {
        this.log(msg, MsgType.ERROR);
    }
    /**
     * outputs debug information
     */
    debug(msg) {
        this.log(msg, MsgType.DEBUG);
    }
    /**
     * logs a message to the console
     */
    log(msg, type) {
        let send = this.getLogString(msg, type);
        switch (type) {
            default:
            case MsgType.INFO:
                console.log(send);
                break;
            case MsgType.WARN:
                console.warn(send);
                break;
            case MsgType.ERROR:
                console.error(send);
                break;
            case MsgType.DEBUG:
                // console.debug(send)
                console.log(send);
                break;
        }
    }
}
exports.default = Logger;
