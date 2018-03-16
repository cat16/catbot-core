export default class SQLError extends Error {
    constructor();
    addSQLMsg(err: Error): SQLError;
}
