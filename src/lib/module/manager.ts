import Module from ".";
import Bot from "../bot";
import NamedElementSearcher from "../util/file-element/searcher";
import { ModuleDirectoryManager } from "./dir-manager";

export default class ModuleManager extends NamedElementSearcher<Module> {
  private bot: Bot;
  private directory: string;

  private mainModule: Module;
  private dirManager: ModuleDirectoryManager;

  constructor(directory: string, bot: Bot) {
    super(" ");
    this.directory = directory;
    this.dirManager = new ModuleDirectoryManager(`${directory}/modules`, bot);
  }

  public load() {
    this.loadMainModule();
    this.dirManager.load();
  }

  // I need to either make a generic module that's not a file element (preferred) or return Module | MainModule (WET code)
  public loadMainModule() {
    this.mainModule = new Module(null, this.bot, this.directory, {
      aliases: []
    });
  }

  public getElements(): Module[] {
    return [this.mainModule].concat(this.dirManager.getElements());
  }
}
