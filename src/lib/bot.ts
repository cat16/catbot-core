import { Client, Message, User } from "discord.js";
import * as fs from "fs";
import { Command, Event, Module } from "..";
import CommandManager from "./command/manager";
import { CommandPermissionContext } from "./command/permission-context";
import CommandRunContext from "./command/runnable/run-context";
import Config from "./config";
import ConsoleInputManager from "./console-input/manager";
import Database from "./database/database-interface";
import DatabaseVariable from "./database/database-variable";
import RuntimeDatabase from "./database/runtime-database";
import SavedVariable from "./database/saved-variable";
import EventManager from "./event/manager";
import DatabaseModule from "./module/database-module";
import ModuleManager from "./module/manager";
import PermissionModule from "./module/permission-module";
import { createDirectory, pathExists } from "./util";
import { formatResponse } from "./util/bot";
import Logger from "./util/logger";

export default class Bot {
  public readonly directory: string;
  public readonly logger: Logger;
  public readonly inputManager: ConsoleInputManager;

  public readonly database: Database;
  public readonly moduleManager: ModuleManager;
  public readonly commandManager: CommandManager;
  public readonly eventManager: EventManager;

  public readonly client: Client;

  public readonly admins: DatabaseVariable<string[]>;

  private activePermCheck: (
    context: CommandPermissionContext
  ) => Promise<boolean>;
  private config: Config;

  constructor(directory: string, config?: Config) {
    this.directory = directory.replace(/\\/g, "/");
    this.logger = new Logger("bot-core");
    this.inputManager = new ConsoleInputManager();

    this.config = config;
    this.client = new Client();

    this.database = new Database();
    this.moduleManager = new ModuleManager(this.directory, this);
    this.commandManager = new CommandManager(this);
    this.eventManager = new EventManager(this);

    this.admins = this.createDatabaseVariable<string[]>("admins", []);
  }

  public getModules(): Module[] {
    return this.moduleManager.getElements();
  }

  public getCommands(): Command[] {
    return this.commandManager.getElements();
  }

  public getEvents(): Event[] {
    return this.eventManager.getElements();
  }

  public async start(): Promise<void> {
    this.logger.info("Starting bot...");
    this.logger.log("Loading...");
    if (!pathExists(this.directory)) {
      createDirectory(this.directory);
    }
    await this.loadConfig("config.json");
    this.moduleManager.loadAll();
    await this.loadDBFromModule();
    this.loadPermCheckFromModule();
    this.commandManager.load();
    this.eventManager.load();
    await this.database.load();
    this.logger.success(`Successfully loaded database.`);
    this.logger.success("Successfully loaded.");
    await this.connect();
    this.logger.success("Successfully started.");
    this.setupConsoleInput();
  }

  // replace with an exit, dummy, and find a way to make stop actually stop it
  public restart(reloadFiles: boolean = false): Promise<Bot> {
    return new Promise(async (resolve, reject) => {
      this.logger.info("Restarting...");
      // TODO: idk if theres a way to disconnect djs hmm
      if (reloadFiles) {
        Object.keys(require.cache).forEach(key => {
          if (!key.includes("node_modules")) {
            delete require.cache[key];
          }
        });
        const NewBot = require(__filename).default;
        const bot = new NewBot(this.directory);
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

  public async stop() {
    this.logger.info("Stopping...");
    await this.client.destroy();
    ConsoleInputManager.stop();
  }

  public getConfig() {
    return this.config;
  }

  public hasPermission(context: CommandPermissionContext) {
    return this.activePermCheck(context);
  }

  public async isAdmin(id: string): Promise<boolean> {
    return (await this.admins.get()).some(admin => admin === id);
  }

  public createDatabaseVariable<T>(
    key: string,
    initValue?: T
  ): DatabaseVariable<T> {
    return new DatabaseVariable<T>(this.database, `bot.${key}`, {
      initValue
    });
  }

  public createSavedVariable<T>(key: string, initValue?: T): SavedVariable<T> {
    return new SavedVariable<T>(this.database, `bot.${key}`, {
      initValue
    });
  }

  public async getOwner(): Promise<User> {
    const application = await this.client.fetchApplication();
    return application.owner;
  }

  public async report(
    title: string,
    description: string,
    context: CommandRunContext
  ): Promise<Message | Message[]> {
    const owner = await this.getOwner();
    return owner.send(
      formatResponse({
        color: 0xff0000,
        description,
        header: { title, symbol: ":exclamation:" },
        trigger: context.msg
      })
    );
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log("Connecting...");
      this.client.once("ready", () => {
        this.logger.success("Successfully connected.");
        resolve();
      });
      this.client.login(this.config.token);
    });
  }

  private loadPermCheckFromModule() {
    const permModuleExists = this.moduleManager.getElements().some(module2 => {
      if (module2 instanceof PermissionModule) {
        this.activePermCheck = module2.hasPermission;
        return true;
      }
    });
    if (!permModuleExists) {
      this.activePermCheck = context => {
        return context.command.hasPermission.call(context.command, context);
      };
    }
  }

  private async loadDBFromModule() {
    const dbModuleExists = this.moduleManager.getElements().some(module2 => {
      if (module2 instanceof DatabaseModule) {
        this.database.setDB(module2.getDatabase());
        return true;
      }
    });
    if (!dbModuleExists) {
      this.database.setDB(new RuntimeDatabase());
      this.logger.warn(
        "No database module detected; defaulting to runtime database."
      );
    }
  }

  private async loadConfig(file: string): Promise<void> {
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
          config[key] = await this.logger.getInput(`Enter ${key}: `);
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
          if (config[key] == null) {
            config[key] = await this.logger.getInput(`Enter ${key}: `);
          }
        }
      }
      writeConfig(config);
      this.logger.success("Config file generated");
      this.config = config;
    }
  }

  private setupConsoleInput() {
    this.inputManager.addEvent({
      func: () => {
        this.stop();
      },
      trigger: "stop"
    });
    ConsoleInputManager.start();
    this.logger.info('Type "stop" at any time to stop');
  }
}
