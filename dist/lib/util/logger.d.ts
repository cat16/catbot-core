export declare enum MsgType {
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    DEBUG = "debug",
}
export default class Logger {
    name: string;
    constructor(name: string, parent?: Logger, field?: string);
    getLogString(msg: string, type?: MsgType): string;
    /**
     * outputs info about what has happened or is going to happen
     */
    info(msg: any): void;
    /**
     * outputs a warning about something that happened
     */
    warn(msg: any): void;
    /**
     * outputs an error
     */
    error(msg: any): void;
    /**
     * outputs debug information
     */
    debug(msg: any): void;
    /**
     * logs a message to the console
     */
    log(msg: string, type?: MsgType): void;
}
