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
const eris_1 = require("eris");
const fs = require("fs");
const readline = require("readline-sync");
const logger_1 = require("./util/logger");
const database_manager_1 = require("./database/database-manager");
const config_1 = require("./config");
const command_manager_1 = require("./command/command-manager");
const event_manager_1 = require("./event/event-manager");
const user_manager_1 = require("./user-manager");
const util_1 = require("./util/util");
const database_1 = require("./default/database");
const BTI = database_1.default.bot;
class Catbot {
    constructor(directory) {
        this.directory = directory;
        this.logger = null;
        this.util = null;
        this.databaseManager = null;
        this.commandManager = null;
        this.table = null;
        this.userManager = null;
        this.client = null;
        this.config = null;
        this.temp = {};
    }
    onrestart(bot, err) { }
    load() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger = new logger_1.default('bot-core');
            this.logger.log('Loading...');
            this.util = new util_1.default(this);
            this.loadConfig('config.json');
            this.databaseManager = new database_manager_1.default('storage', this.logger);
            this.commandManager = new command_manager_1.default(this);
            this.eventManager = new event_manager_1.default(this);
            this.client = new eris_1.Client(this.config.token, {});
            // load database
            yield this.databaseManager.load(this.directory).catch(err => { return reject(err); });
            yield this.util.multiPromise([
                this.registerDir(`${__dirname}/default`, false, true).catch(err => { return reject(err); }),
                this.registerDir(this.directory, this.config.generateFolders, false).catch(err => { return reject(err); })
            ]);
            this.table = this.databaseManager.tables[BTI.name];
            this.userManager = new user_manager_1.default(this.databaseManager);
            this.commandManager.load();
            yield this.commandManager.reload().catch(err => { return reject(err); });
            yield this.eventManager.reload().catch(err => { return reject(err); });
            this.logger.log('Successfully loaded.');
            resolve();
        }));
    }
    registerDir(directory, generateFolders, defaultFolder) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield this.databaseManager.loadFile(`${directory}/database.js`).catch(err => { return reject(err); });
            this.eventManager.addDir(`${directory}/events`, generateFolders, defaultFolder);
            this.commandManager.addDir(`${directory}/commands`, generateFolders, defaultFolder);
            resolve();
        }));
    }
    /*registerEvents (directory: string, generateFolders: boolean) {
      let events = load(directory, generateFolders)
      if (events == null) return
      for (let event in events) {
        let eventFunc = events[event]
        if (eventFunc instanceof Function) {
          let logger = new Logger(`event::${event}`, this.logger)
          this.client.on(event, (data) => {
            try {
              eventFunc.call({ logger }, data, this)
            } catch (ex) {
              this.logger.error(`Event '${event}' crashed! : ${ex.stack}`)
            }
          })
        } else {
          this.logger.warn(`Could not load event '${event}': No function was exported`)
        }
      }
    }*/
    connect() {
        return new Promise((resolve, reject) => {
            this.logger.log('Connecting...');
            this.client.on('ready', () => {
                this.logger.log('Successfully connected.');
                resolve();
            });
            this.client.connect();
        });
    }
    loadConfig(file) {
        let writeConfig = (config) => {
            fs.writeFileSync(`${this.directory}/${file}`, JSON.stringify(config, null, '\t'));
        };
        if (fs.existsSync(`${this.directory}/${file}`)) {
            let config = require(`${this.directory}/${file}`);
            let updated = false;
            let neededConfig = new config_1.default();
            for (let key in neededConfig) {
                if (config[key] == null && neededConfig[key] === undefined) {
                    if (!updated)
                        this.logger.warn(`Config is not completed! Please fill in the following values...`);
                    config[key] = this.getInput(key);
                    updated = true;
                }
            }
            if (updated) {
                writeConfig(config);
                this.logger.log('Config file updated.');
            }
            this.config = config;
        }
        else {
            this.logger.warn('No config file detected!\nCreating new config file...');
            let config = new config_1.default();
            for (let key in config) {
                if (config[key] == null)
                    config[key] = this.getInput(`Enter ${key}`);
            }
            writeConfig(config);
            this.logger.log('Config file generated');
            this.config = config;
        }
    }
    getInput(msg) {
        return readline.question(this.logger.getLogString(`${msg}: `));
    }
    start() {
        return new Promise((resolve, reject) => {
            this.load().then(() => {
                this.connect().then(resolve, reject);
            }, reject);
        });
    }
    restart(reloadFiles = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Restarting...');
            this.client.disconnect({ reconnect: false });
            if (reloadFiles) {
                Object.keys(require.cache).forEach(function (key) { if (!key.includes('node_modules'))
                    delete require.cache[key]; });
                let NewCatbot = require(__filename).default;
                let bot = new NewCatbot(this.directory);
                bot.start().then(() => {
                    this.onrestart(bot);
                    resolve(bot);
                }, err => {
                    this.onrestart(bot, err);
                    reject(err);
                });
            }
            else {
                this.temp = {};
                this.start().then(resolve.bind(null, this), reject.bind(null, this));
            }
        }));
    }
    stop() {
        this.logger.info('Stopping...');
        this.client.disconnect({ reconnect: false });
    }
    // Database Functions
    get(key, defaultValue = null) {
        return this.table.get(key, 'value', defaultValue);
    }
    set(key, value) {
        return this.table.set(key, { name: 'value', value });
    }
}
exports.default = Catbot;
