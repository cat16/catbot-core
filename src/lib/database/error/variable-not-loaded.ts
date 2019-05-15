import DatabaseInterface from "../database-interface";
import ModuleDatabase from "../module-database";

export default class VariableNotLoadedError extends Error {
    constructor(key: string, db: ModuleDatabase | DatabaseInterface) {
        super(`Could not synchronously access data for variable '${key}' from database ${db.getId()}: Variable not loaded`);
    }
}