import { Bot } from "../..";
import FileElement from "../element/file-element";
import { CommandLoader } from "./command/command-manager";
import { EventLoader } from "./event/event-manager";
import NamedElement from "../element/named-element";

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
  private commandManager: CommandLoader;
  private eventManager: EventLoader;

  constructor(data: ModuleConstructionData, options: ModuleOptions) {
    super(data.directory);
    this.commandManager = new CommandLoader(data.directory);
    this.eventManager = new EventLoader(data.directory);
    this.name = options.name;
    this.bot = data.bot;
  }

  public getAliases(): string[] {
    return [];
  }

  public getName(): string {
    return this.name;
  }

  public getCommandManager(): CommandLoader {
    return this.commandManager;
  }

  public getEventManager(): EventLoader {
    return this.eventManager;
  }
}
