import { Client } from "eris";
import * as fs from "fs";

import Config from "./config";
import Database from "./database/client-database";
import { CommandManager } from "./module/command/manager";
import { EventManager } from "./module/event/manager";
import { ModuleManager } from "./module/manager";
import Module from "./module/module";
import Logger from "./util/logger";
import BotUtil, { createDirectory, getInput, pathExists } from "./util/util";

export default class Bot {
  private directory: string;
  private logger: Logger;
  private util: BotUtil;
  private activeDatabase: Database;
  private moduleManager: ModuleManager;
  private commandManager: CommandManager;
  private eventManager: EventManager;
  private client: Client;
  private config: Config;

  constructor(directory: string) {
    this.directory = directory;
    this.logger = new Logger("bot-core");
    this.util = new BotUtil(this);
    this.activeDatabase = null;
    this.moduleManager = new ModuleManager(this);
    this.client = new Client(this.config.token, {});
    this.config = null;
  }

  public load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger("bot-core");
      this.logger.log("Loading...");
      this.util = new BotUtil(this);
      this.loadConfig("config.json");
      this.activeDatabase = new DatabaseClient(
        {
          password: this.config.dbPassword,
          uri: this.config.dbURI,
          user: this.config.dbUser
        },
        this.logger
      );
      if (!pathExists(this.directory)) {
        createDirectory(this.directory);
      }
      this.moduleManager.loadDirectory(`${__dirname}/default-modules`);
      this.moduleManager.addLoader(new ModuleLoader(this.directory, this));
      this.logger.success("Successfully loaded.");
      resolve();
    });
  }

  public getModule(name: string): Module {
    return this.moduleManager.find(name).data.element;
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

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getUtil(): BotUtil {
    return this.util;
  }

  public getDatabase(): Database {
    return this.activeDatabase;
  }

  public getClient() {
    return this.client;
  }

  public getConfig() {
    return this.config;
  }
}
