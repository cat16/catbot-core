"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const load_1 = require("./util/load");
class Handler {
    constructor(bot, logger, elementName) {
        this.bot = bot;
        this.logger = logger;
        this.elements = [];
        this.loadDirs = [];
        this.elementName = elementName;
    }
    addDir(directory, generateFolders, isDefault) {
        this.loadDirs.push({ path: directory, generateFolders, isDefault });
    }
    add(element, path, isDefault = false) {
        let fileName = path.split('/').pop().split('.')[0];
        element.getAllElements().forEach(e => {
            e.path = path;
            e.fileName = fileName;
            if (isDefault)
                e.isDefault = true;
        });
        return this.push(element);
    }
    reload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger.info(`Reloading ${this.elementName}s...`);
            this.elements = [];
            let loadedDirs = 0;
            for (let dir of this.loadDirs) {
                let elementFuncs = load_1.default(dir.path, dir.generateFolders);
                if (elementFuncs == null) {
                    loadedDirs++;
                    continue;
                }
                let unloaded = 0;
                let loaded = 0;
                let totalLoaded = 0;
                for (let elementFunc in elementFuncs) {
                    unloaded++;
                    let element = elementFuncs[elementFunc](this.bot);
                    this.add(element, `${dir.path}/${elementFunc}`, dir.isDefault).then(() => {
                        loaded++;
                        totalLoaded += element.getAllElements().length;
                        if (loaded >= unloaded) {
                            this.logger.info(`Loaded ${totalLoaded} ${this.elementName}${totalLoaded === 1 ? '' : 's'} from ${dir.path}`);
                            loadedDirs++;
                            if (loadedDirs >= this.loadDirs.length) {
                                this.logger.info(`Successfully reloaded all ${this.elementName}s.`);
                                resolve();
                            }
                        }
                    }, (err) => {
                        this.logger.error(`Could not load ${this.elementName} from file '${elementFunc}': ${err.stack}`);
                        unloaded--;
                    });
                }
            }
        }));
    }
    reloadElement(name) {
        let reload = (path, isDefault) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let element;
                try {
                    let required = require(path);
                    element = required.default !== undefined ? required.default(this.bot) : required(this.bot);
                }
                catch (err) {
                    reject(err);
                    return;
                }
                delete require.cache[require.resolve(path)];
                this.elements = this.elements.filter(e => e !== element);
                this.add(element, path, isDefault).then(() => {
                    this.logger.info(`Successfully reloaded file for ${this.elementName} '${element.fileName}'`);
                    resolve();
                }, err => {
                    this.logger.error(`Failed to reload file for ${this.elementName} '${element.fileName}': ${err.stack}`);
                    reject(err);
                });
            }));
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger.info(`Attemping to reload ${this.elementName} '${name}'...`);
            let result = this.find(name);
            if (result !== null) {
                let path = result.element.path;
                return reload(path, result.element.isDefault).then(() => { resolve(); }, reject);
            }
            else {
                for (let dir of this.loadDirs) {
                    let path = `${dir.path}/${name}`;
                    if (fs.existsSync(path)) {
                        try {
                            /** @type {Command} */
                            return reload(path, dir.isDefault).then(() => { resolve(); }, reject);
                        }
                        catch (ex) {
                            return reject(new Error(`Could not reload ${this.elementName} '${name}':\n\`\`\`js\n${ex.stack}\n\`\`\``));
                        }
                    }
                }
                reject(new Error(`:x: No ${this.elementName} named '${name}' found`));
            }
        }));
    }
}
exports.default = Handler;
