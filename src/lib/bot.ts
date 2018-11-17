import { Client } from "eris";
import * as fs from "fs";

import CommandManager from "./command/manager";
import Config from "./config";
import Database from "./database/client-database";
import DatabaseVariable from "./database/database-variable";
import EventManager from "./event/manager";
import Module from "./module";
import ModuleManager from "./module/manager";
import BotUtil, { createDirectory, getInput, pathExists } from "./util";
import Logger from "./util/logger";

export default class Bot {
  public readonly directory: string;
  public readonly logger: Logger;
  public readonly util: BotUtil;

  public readonly client: Client;
  public readonly moduleManager: ModuleManager;
  public readonly commandManager: CommandManager;
  public readonly eventManager: EventManager;

  private activeDatabase: Database;
  private config: Config;

  constructor(directory: string) {
    this.directory = directory;
    this.logger = new Logger("bot-core");
    this.util = new BotUtil(this);
    this.activeDatabase = null;
    this.moduleManager = new ModuleManager(directory, this);
    this.client = new Client(this.config.token, {});
    this.config = null;
  }

  public load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger.log("Loading...");
      this.loadConfig("config.json");
      if (!pathExists(this.directory)) {
        createDirectory(this.directory);
      }
      this.moduleManager.load();
      this.logger.success("Successfully loaded.");
      resolve();
    });
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log("Connecting...");
      this.client.on("ready", () => {
        this.logger.success("Successfully connected.");
        resolve();
      });
      this.client.connect();
    });
  }

  public async loadConfig(file: string): Promise<void> {
    const writeConfig = config => {
      fs.writeFileSync(
        `${this.directory}/${file}`,
        JSON.stringify(config, null, "\t")
      );
    };

    if (fs.existsSync(`${this.directory}/${file}`)) {
      const config = require(`${this.directory}/${file}`);
      let updated = false;
      const neededConfig = new Config();
      for (const key in neededConfig) {
        if (config[key] == null && neededConfig[key] === undefined) {
          if (!updated) {
            this.logger.warn(
              `Config is not completed! Please fill in the following values...`
            );
          }
          process.stdout.write(this.logger.getLogString(key));
          config[key] = await getInput();
          updated = true;
        }
      }
      if (updated) {
        writeConfig(config);
        this.logger.success("Config file updated.");
      }
      this.config = config;
    } else {
      this.logger.warn("No config file detected!\nCreating new config file...");
      const config = new Config();
      for (const key in config) {
        if (config.hasOwnProperty(key)) {
          process.stdout.write(this.logger.getLogString(`Enter ${key}: `));
          if (config[key] == null) {
            config[key] = await getInput();
          }
        }
      }
      writeConfig(config);
      this.logger.success("Config file generated");
      this.config = config;
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info("Starting bot...");
      this.load().then(() => {
        this.connect().then(resolve, reject);
      }, reject);
    });
  }

  // replace with an exit, dummy, and find a way to make stop actually stop it
  public restart(reloadFiles: boolean = false): Promise<Bot> {
    return new Promise(async (resolve, reject) => {
      this.logger.info("Restarting...");
      this.client.disconnect({ reconnect: false });
      if (reloadFiles) {
        Object.keys(require.cache).forEach(key => {
          if (!key.includes("node_modules")) {
            delete require.cache[key];
          }
        });
        const NewCatbot = require(__filename).default;
        const bot = new NewCatbot(this.directory);
        bot.start().then(
          () => {
            resolve(bot);
          },
          err => {
            reject(err);
          }
        );
      } else {
        this.start().then(resolve.bind(null, this), reject.bind(null, this));
      }
    });
  }

  public stop() {
    this.logger.info("Stopping...");
    this.client.disconnect({ reconnect: false });
  }

  public getDatabase(): Database {
    return this.activeDatabase;
  }

  public getConfig() {
    return this.config;
  }

  public createDatabaseVariable<T>(
    key: string[],
    defaultValue?: T
  ): DatabaseVariable<T> {
    return new DatabaseVariable<T>(this.getDatabase(), key, defaultValue);
  }
}
