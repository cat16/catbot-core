import Module from ".";
import Bot from "../bot";
import NamedElementSearcher from "../util/file-element/searcher";
import { ModuleDirectoryManager } from "./dir-manager";

export default class ModuleManager extends NamedElementSearcher<Module> {
  public readonly bot: Bot;
  public readonly directory: string;

  public readonly dirManager: ModuleDirectoryManager;
  public readonly defManager: ModuleDirectoryManager; // TODO: replace with coreModule: Module once finished with stuff

  private mainModule: Module;

  constructor(directory: string, bot: Bot) {
    super(" ");
    this.directory = directory;
    this.dirManager = new ModuleDirectoryManager(`${directory}/modules`, bot);
    this.defManager = new ModuleDirectoryManager(
      `${__dirname}/../../default-modules`,
      bot
    );
  }

  public load() {
    this.loadMainModule();
    this.dirManager.load();
    this.defManager.load();
  }

  public loadMainModule() {
    this.mainModule = new Module(null, this.bot, this.directory, {
      aliases: []
    });
  }

  public getElements(): Module[] {
    return [this.mainModule].concat(this.dirManager.getElements());
  }
}
