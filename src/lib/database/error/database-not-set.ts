export default class DatabaseNotSetError extends Error {
    constructor() {
        super("The database was not set");
    }
}