import { Bot } from '../..';
import FileElement from '../element/file-element';
import { CommandLoader } from './command/command-manager';
import { EventLoader } from './event/event-manager';

export interface ModuleConstructionData {
  directory: string;
  bot: Bot;
}

export interface ModuleOptions {
  name: string;
  triggers?: string[];
  defaultData?: object;
}

export default abstract class Module extends FileElement {
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

  public getTriggers(): string[] {
    return [this.name];
  }

  public getName() {
    return this.name;
  }

  public getCommandManager(): CommandLoader {
    return this.commandManager;
  }

  public getEventManager(): EventLoader {
    return this.eventManager;
  }
}
