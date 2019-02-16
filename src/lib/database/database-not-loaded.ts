import DatabaseInterface from "./database-interface";
import ModuleDatabase from "./module-database";

export default class DatabaseNotLoadedError extends Error {
    constructor(db: ModuleDatabase | DatabaseInterface) {
        super(`Could not synchronously access data from database ${db.getId()}: The database was not loaded`);
    }
}