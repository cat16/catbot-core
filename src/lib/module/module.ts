import { Bot } from "../..";
import FileElement from "../file-element/file-element";
import NamedElement from "../file-element/named-element";
import { CommandDirectoryManager } from "./command/manager";
import { EventManager } from "./event/manager";

export interface ModuleConstructionData {
  directory: string;
  bot: Bot;
}

export interface ModuleOptions {
  name: string;
  triggers?: string[];
  defaultData?: object;
}

export default abstract class BotModule extends FileElement
  implements NamedElement {
  public bot: Bot;
  private name: string;
  private commandManager: CommandDirectoryManager;
  private eventManager: EventManager;

  constructor(data: ModuleConstructionData, options: ModuleOptions) {
    super(data.directory);
    this.commandManager = new CommandDirectoryManager(data.directory, data.bot);
    this.eventManager = new EventManager(data.directory, data.bot);
    this.name = options.name;
    this.bot = data.bot;
  }

  public getAliases(): string[] {
    return [];
  }

  public getName(): string {
    return this.name;
  }

  public getCommandManager(): CommandDirectoryManager {
    return this.commandManager;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }
}
