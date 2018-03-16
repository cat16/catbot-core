export interface ConfigOptions {
    token: string;
    ownerID: string;
    defaultPrefix: string;
    generateFolders: boolean;
}
export default class Config {
    token: string;
    ownerID: string;
    defaultPrefix: string;
    generateFolders: boolean;
    constructor(options?: ConfigOptions | any);
}
