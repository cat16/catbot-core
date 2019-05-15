import Module from ".";
import { DEFAULT_DIR } from "../../definitions";
import Bot from "../bot";
import { pathExists, reportErrors } from "../util";
import { DirLoadResult } from "../util/file-element/manager/dir";
import NamedElementSearcher from "../util/file-element/searcher";
import Logger from "../util/logger";
import { ModuleDirectoryManager } from "./dir-manager";

export default class ModuleManager extends NamedElementSearcher<Module> {
  public readonly bot: Bot;
  public readonly logger: Logger;
  public readonly directory: string;

  public readonly dirManager: ModuleDirectoryManager;
  private coreModule: Module;
  private mainModule: Module;

  constructor(directory: string, bot: Bot) {
    super(" ");
    this.bot = bot;
    this.logger = new Logger("module-manager", bot.logger);
    this.directory = directory;
    this.bot = bot;
    this.dirManager = new ModuleDirectoryManager(`${directory}/modules`, bot);
    this.coreModule = null;
  }

  public loadAll() {
    const errors = new Map<string, Error>();
    this.loadCoreModule();
    if (pathExists(this.dirManager.getDirectory())) {
      this.dirManager.loadAll().forEach((err, key) => {
        errors.set(key, err);
      });
    }
    this.loadMainModule();
    reportErrors(this.logger, "module", errors);
    this.logger.success(
      `Successfully loaded ${this.getElements().length} modules.`
    );
  }

  public async loadModule(name: string): Promise<DirLoadResult<Module>> {
    return this.dirManager.load(name);
  }

  public unloadModule(name: string): boolean {
    const module = this.find(name);
    if (module) {
      module.unload();
      return this.dirManager.unload(module);
    } else {
      return false;
    }
  }

  public getElements(): Module[] {
    return [this.coreModule, this.mainModule].concat(
      this.dirManager.getElements()
    );
  }

  public getExternalModules() {
    return this.dirManager.getElements();
  }

  public getCoreModule() {
    return this.coreModule;
  }

  public getMainModule() {
    return this.mainModule;
  }

  private loadMainModule() {
    const name = this.directory.split("/").pop();
    const path = this.directory;
    const result = this.dirManager.getLoader().loadExternal(path, name);
    if(result.element instanceof Module) {
      this.mainModule = result.element;
    } else {
      this.logger.error(`Failed to load main module: ${result.found ? result.element : "module not found"}`);
    }
  }

  private loadCoreModule() {
    const name = "core";
    const path = `${DEFAULT_DIR}/core-module`;
    const result = this.dirManager.getLoader().loadExternal(path, name);
    if(result.element instanceof Module) {
      this.coreModule = result.element;
    } else {
      this.logger.error(`Failed to load core module: ${result.found ? result.element : "module not found"}`);
    }
  }
}
