import Logger from './util/logger';
import Catbot from './bot';
export interface Directory {
    path: string;
    generateFolders: boolean;
    isDefault: boolean;
}
export interface Element {
    fileName: string;
    getAllElements(): Element[];
    path: string;
    isDefault: boolean;
}
export interface ElementSearchResult<T extends Element> {
    element: T;
    content: string;
}
export declare type ElementFunc<T extends Element> = (Catbot) => T;
export default abstract class Handler<T extends Element> {
    bot: Catbot;
    logger: Logger;
    elements: T[];
    loadDirs: Directory[];
    elementName: string;
    constructor(bot: Catbot, logger: Logger, elementName: string);
    addDir(directory: string, generateFolders: boolean, isDefault: boolean): void;
    abstract push(element: T): Promise<void>;
    abstract find(content: string): ElementSearchResult<T>;
    add(element: T, path: string, isDefault?: boolean): Promise<void>;
    reload(): Promise<void>;
    reloadElement(name: string): Promise<void>;
}
