import Module from ".";
import DEF_DIR from "../../def-modules-dir";
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
  public readonly defManager: ModuleDirectoryManager; // TODO: replace with coreModule: Module once finished with stuff

  private mainModule: Module;

  constructor(directory: string, bot: Bot) {
    super(" ");
    this.bot = bot;
    this.logger = new Logger("module-manager", bot.logger);
    this.directory = directory;
    this.bot = bot;
    this.dirManager = new ModuleDirectoryManager(`${directory}/modules`, bot);
    this.defManager = new ModuleDirectoryManager(DEF_DIR, bot);
  }

  public loadAll() {
    const errors = new Map<string, Error>();
    this.loadMainModule();
    if (pathExists(this.dirManager.getDirectory())) {
      this.dirManager.loadAll().forEach((err, key) => {
        errors.set(key, err);
      });
    }
    this.defManager.loadAll().forEach((err, key) => {
      errors.set(key, err);
    });
    reportErrors(this.logger, "module", errors);
    this.logger.success(
      `Successfully loaded ${this.getElements().length} modules.`
    );
  }

  public async loadModule(
    name: string
  ): Promise<DirLoadResult<Module>> {
    const result = this.dirManager.load(name);
    await this.bot.database.load();
    return result;
  }

  public unloadModule(
    name: string
  ): boolean {
    return this.dirManager.unload(name);
  }

  public loadMainModule() {
    this.mainModule = new Module(this.directory.split("/").pop(), this.bot, this.directory, {});
  }

  public getElements(): Module[] {
    return [this.mainModule].concat(
      this.defManager.getElements(),
      this.dirManager.getElements()
    );
  }
}
