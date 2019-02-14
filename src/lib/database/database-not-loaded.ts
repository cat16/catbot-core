export default class DatabaseNotLoadedError extends Error {
    constructor() {
        super("The database was not loaded!")
    }
}